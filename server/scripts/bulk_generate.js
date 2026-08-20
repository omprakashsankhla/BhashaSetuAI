const fs = require('fs');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const BATCH_SIZE = 10;
const LANGUAGES = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'mwr', 'ur'];

// 1. Get the 88 lessons from assessment.js
const assessmentCode = fs.readFileSync(path.join(__dirname, '../routes/assessment.js'), 'utf8');
const allLessons = [];
['curriculumBeginner', 'curriculumIntermediate', 'curriculumAdvanced'].forEach(arrName => {
    const match = assessmentCode.match(new RegExp('let ' + arrName + ' = \\[\([\\s\\S]*?)\\];'));
    if (match) {
        const str = '[' + match[1] + ']';
        try {
            const cleanStr = str.replace(/(['\"])?([a-zA-Z0-9_]+)(['\"])?:/g, '"$2":').replace(/'/g, '"');
            const arr = eval(str);
            arr.forEach(l => {
                allLessons.push({ title: l.title, level: arrName.replace('curriculum', ''), type: l.type });
            });
        } catch(e) {}
    }
});

// 2. Apply Type Logic
const assignType = (title) => {
    const lower = title.toLowerCase();
    if (lower.match(/quiz|test|assessment|capstone|challenge/)) return 'quiz';
    if (lower.match(/read|passage|story|article|sign|menu|email|text message|proofreading|discourse analysis|stylistics|literary devices|poetics/)) return 'reading';
    if (lower.match(/speak|role[\s\-]?play|pronounce|aloud|introduce|interview|dialogue|debate|express|discuss|expressions|rhetoric|persuasion|argumentation|leadership|crisis communication|networking|negotiation/)) return 'speaking';
    if (lower.match(/verb|noun|pronoun|tense|adjective|sentence|grammar|structure|plural|conjunction|preposition|question|article|syntax|writing/)) return 'grammar';
    if (lower.match(/audio|listen|podcast|speech|pragmatics/)) return 'listening';
    return 'vocabulary';
};
allLessons.forEach(l => l.structural_type = assignType(l.title));

// 3. Load Reuse Audit
const reuseMap = {
    'Family': 'Flashcards: Family',
    'Colors': 'PictureMatch: Colors',
    'Numbers': 'ShopKeeper: Numbers',
    'Animals': 'PictureMatch: Animals',
    'Fruits': 'PictureMatch: Food',
    'Vegetables': 'PictureMatch: Food',
    'Object Identification': 'PictureMatch: Everyday Objects',
    'Bank': 'Bank Fraud Protection (Intermediate)',
    'Bus': 'The Bus Ride',
    'Market': 'At the Market (Beginner)',
    'Emergency': 'Emergency Response (Beginner)',
    'Reading Signs': 'SignReader: Signs',
    'Family and Relationships': 'Flashcards: Family',
    'Advanced Colors & Descriptive Adjectives': 'PictureMatch: Colors',
    'Advanced Numeracy and Statistics': 'ShopKeeper: Numbers',
    'Fauna and Ecological Systems': 'PictureMatch: Animals',
    'Culinary Arts and Grocery': 'PictureMatch: Food',
    'Advanced Public Speaking and Oratory': 'Public Wi-Fi Warning (Intermediate)'
};

// 4. Batch Processing
const batchNum = parseInt(process.argv[2]) || 1;
const startIndex = (batchNum - 1) * BATCH_SIZE;
const endIndex = Math.min(startIndex + BATCH_SIZE, allLessons.length);
const batchLessons = allLessons.slice(startIndex, endIndex);

console.log(`Starting Batch ${batchNum}: Lessons ${startIndex + 1} to ${endIndex}`);

async function generateLessonContent(lesson, language) {
    const reuseContext = reuseMap[lesson.title] ? `Note: Base the content around this existing topic/story: "${reuseMap[lesson.title]}"` : 'Create entirely fresh content.';
    
    const prompt = `
Generate a structured language learning lesson for a language learning app.
Target Language: ${language}
Lesson Title: "${lesson.title}"
Difficulty Level: ${lesson.level}
Primary Structural Type: ${lesson.structural_type}

Rules:
1. Provide natural, native-sounding phrasing per language — not word-for-word translation from English.
2. Culturally appropriate for Indian daily life, religiously/politically neutral.
3. Consistent, readable Roman-script transliteration system for non-English languages.
4. Difficulty must genuinely escalate (Beginner = 3-6 words, Intermediate = complex structures, Advanced = abstract/technical).
5. Voice-type comprehension checks MUST use { correct_answer: null } to trigger voice assessment infrastructure.
6. ${reuseContext}

Output strictly as a JSON object with the following keys:
- vocabulary_core: Array of 5-10 key vocabulary items ({ word, translation, transliteration, part_of_speech }).
- example_sentences: Array of 3-5 example sentences using the vocab ({ sentence, translation, transliteration, audio_prompt }).
- reading_passage: A short passage/dialogue matching the difficulty level ({ text, translation, transliteration }).
- comprehension_production_check: Array of 2-3 interactive questions ({ type, question, options, correct_answer, hint }). If testing speaking/listening, use type 'voice' and correct_answer 'null'.
- game_activity_hook: A suggested minigame hook ({ game_type, description, target_vocab_keys }).
`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: prompt }],
            response_format: { type: 'json_object' }
        });
        return JSON.parse(response.choices[0].message.content);
    } catch (e) {
        console.error(`Error generating ${lesson.title} in ${language}:`, e.message);
        return { error: e.message };
    }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runBatch() {
    const results = [];
    let wordCount = 0;
    const flaggedLanguages = new Set();
    
    for (const lesson of batchLessons) {
        console.log(`Processing: ${lesson.title} (${lesson.level})`);
        const lessonOutput = { ...lesson, content: {} };
        
        // Process languages sequentially to avoid rate limit
        for (const lang of LANGUAGES) {
            console.log(`  - Generating for ${lang}...`);
            const content = await generateLessonContent(lesson, lang);
            lessonOutput.content[lang] = content;
            
            // Count words roughly
            const jsonStr = JSON.stringify(content);
            wordCount += jsonStr.split(/[\\s,]+/).length;
            
            // Flag if error or suspicious
            if (content.error || jsonStr.includes('word-for-word') || Object.keys(content).length < 5) {
                flaggedLanguages.add(lang);
            }
            
            await sleep(200); // 0.2 second delay
        }
        
        results.push(lessonOutput);
    }
    
    const outPath = path.join(__dirname, `../data/bulk_lessons_batch_${batchNum}.json`);
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
    
    console.log(`\n--- BATCH ${batchNum} COMPLETE ---`);
    console.log(`Lessons covered: ${batchLessons.map(l => l.title).join(', ')}`);
    console.log(`Total approximate word count generated: ${wordCount}`);
    console.log(`Flagged languages (errors/missing fields/low confidence): ${flaggedLanguages.size > 0 ? Array.from(flaggedLanguages).join(', ') : 'None'}`);
    console.log(`Output saved to: ${outPath}`);
    
    // Validation check
    let valid = true;
    for (const res of results) {
        for (const lang of LANGUAGES) {
            const c = res.content[lang];
            if (!c || !c.vocabulary_core || !c.example_sentences || !c.reading_passage || !c.comprehension_production_check || !c.game_activity_hook) {
                valid = false;
                console.log(`Validation failed for ${res.title} in ${lang}`);
            }
        }
    }
    console.log(`Structural Validation: ${valid ? 'PASSED (All 5 parts present)' : 'FAILED'}`);
}

runBatch();
