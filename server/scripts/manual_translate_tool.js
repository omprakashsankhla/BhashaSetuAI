const fs = require('fs');
const path = require('path');

const command = process.argv[2];
const type = process.argv[3];
const targetLang = process.argv[4];
const interfaceLang = process.argv[5];
const extraArg = process.argv[6]; // output file for export, input file for import

const languageNames = {
  en: 'English', hi: 'Hindi', mwr: 'Marwadi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi', ur: 'Urdu'
};

const dataDir = path.join(__dirname, '../data');
const cachePath = path.join(dataDir, 'translation_cache.json');

const filesToLoad = {
  'lessons': 'lessons_en.json',
  'lessons_intermediate': 'lessons_intermediate_en.json',
  'lessons_advanced': 'lessons_advanced_en.json',
  'conversation-sim': 'conversationSimBank.json',
  'audio-comp': 'audioCompBank.json',
  'speech-prep': 'speechPrepBank.json',
  'article-translation': 'articleTranslationBank.json',
  'picture-match': 'pictureMatchBank.json',
};

function getPrompt(type, targetLangName, interfaceLangName, itemsStr) {
    if (type.startsWith('lessons')) {
        return `You are a professional language teacher. Translate and adapt the following JSON content of learning activities.
Target Learning Language: ${targetLangName}
User's Interface/Instruction Language: ${interfaceLangName}

Ensure that:
1. All instruction text, question prompts, and feedback strings are translated into ${interfaceLangName}.
2. All vocabulary words under test, correct answers, reading text, and options are written in ${targetLangName} (or are appropriate translations matching the context).
3. Do NOT change the JSON structure, keys, number of items, or types.
4. Output ONLY the raw JSON matching the structure. Do not wrap in markdown \`\`\`json blocks.

JSON to translate:
${itemsStr}`;
    } else if (type === 'conversation-sim') {
        return `You are a professional language teacher. Translate and adapt this JSON array containing conversation simulation scenarios.
Target Learning Language (which the user is learning and MUST practice speaking): ${targetLangName}
User's Interface/Instruction Language: ${interfaceLangName}

Ensure that:
1. Translate "title" into ${interfaceLangName}.
2. Translate "initialMessage" into ${targetLangName}.
3. Adapt "systemPrompt" (the instructions to the AI chatbot) so that it says in English: "You are [role]. You MUST converse ONLY in ${targetLangName}. Help the user... keep your responses concise, and use natural B1-level ${targetLangName} vocabulary and sentence structures."
4. Do NOT change the JSON structure, keys, number of items, or types. Output strictly valid JSON. Output ONLY raw JSON.

JSON:
${itemsStr}`;
    } else if (type === 'audio-comp') {
        return `You are a professional language teacher. Translate and adapt this JSON array of audio comprehension tasks.
Target Learning Language (which the user is learning to listen to): ${targetLangName}
User's Interface/Instruction Language (which the user uses to read questions and options): ${interfaceLangName}

Ensure that:
1. Translate "title" into ${interfaceLangName}.
2. Translate "transcript" into ${targetLangName}.
3. In "questions" array, for each question object:
   - Translate "question" into ${interfaceLangName}.
   - Translate all options in the "options" array into ${interfaceLangName}.
   - Translate "answer" into ${interfaceLangName} (matching the correct option).
4. Do NOT change the JSON structure. Output ONLY raw JSON.

JSON:
${itemsStr}`;
    } else if (type === 'speech-prep') {
        return `You are a professional language teacher. Translate and adapt this JSON array of speech preparation tasks.
Target Learning Language: ${targetLangName}
User's Interface/Instruction Language: ${interfaceLangName}

Ensure that:
1. Translate "topic" into ${interfaceLangName}.
2. Translate all items in the "tips" array into ${interfaceLangName}.
3. Do NOT change the JSON structure. Output ONLY raw JSON.

JSON:
${itemsStr}`;
    } else if (type === 'article-translation') {
        return `You are a professional language teacher. Translate and adapt this JSON array of article translation tasks.
Target Learning Language (the language of the article to be translated): ${targetLangName}
User's Interface/Instruction Language: ${interfaceLangName}

Ensure that:
1. Translate "title" into ${targetLangName}.
2. Translate "text" into ${targetLangName} (the article content which the user will read and translate).
3. Do NOT change the JSON structure. Output ONLY raw JSON.

JSON:
${itemsStr}`;
    } else if (type === 'picture-match') {
        return `You are a professional language teacher. Translate and adapt this vocabulary match bank.
Target Learning Language: ${targetLangName}
User's Interface/Instruction Language: ${interfaceLangName}

Ensure that:
1. "word_target" must be translated/written in ${targetLangName}.
2. "word_english" must be translated/written in ${interfaceLangName}.
3. "category" must be written in ${interfaceLangName}.
4. Maintain the exact JSON array structure. Output ONLY the raw JSON. No markdown blocks.

JSON:
${itemsStr}`;
    }
}

function loadEnglishData(type) {
    const filename = filesToLoad[type];
    if (!filename) throw new Error("Unknown type " + type);
    const data = JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));
    
    // Lessons have { activities: [] } array
    if (type.startsWith('lessons')) {
        const activities = [];
        for (const lesson of data) {
            if (lesson.activities) {
                activities.push(...lesson.activities);
            }
        }
        return activities;
    }
    return data;
}

if (command === 'export') {
    if (!type || !targetLang || !interfaceLang) {
        console.log("Usage: node manual_translate_tool.js export <type> <targetLang> <interfaceLang> [outputFile.txt]");
        process.exit(1);
    }
    const englishItems = loadEnglishData(type);
    
    let cache = {};
    if (fs.existsSync(cachePath)) {
        cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
    
    const toTranslate = [];
    for (const item of englishItems) {
        const itemStr = JSON.stringify(item);
        const mappedType = type.startsWith('lessons') ? 'lessons' : type;
        const cacheKey = `${mappedType}_item_${targetLang}_${interfaceLang}_${itemStr}`;
        if (!cache[cacheKey]) {
            toTranslate.push(item);
        }
    }
    
    if (toTranslate.length === 0) {
        console.log("Everything is already translated and cached for this combination!");
        process.exit(0);
    }
    
    const targetLangName = languageNames[targetLang];
    const interfaceLangName = languageNames[interfaceLang];
    
    const prompt = getPrompt(type, targetLangName, interfaceLangName, JSON.stringify(toTranslate, null, 2));
    const outFile = extraArg || `prompt_${type}_${targetLang}_${interfaceLang}.txt`;
    fs.writeFileSync(outFile, prompt);
    console.log(`\n✅ Prompt exported to ${outFile}.`);
    console.log(`Please open this file, copy all text, and paste it into ChatGPT or Gemini Advanced.`);

} else if (command === 'import') {
    if (!type || !targetLang || !interfaceLang || !extraArg) {
        console.log("Usage: node manual_translate_tool.js import <type> <targetLang> <interfaceLang> <translated_result.json>");
        process.exit(1);
    }
    
    const englishItems = loadEnglishData(type);
    let cache = {};
    if (fs.existsSync(cachePath)) {
        cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
    
    const mappedType = type.startsWith('lessons') ? 'lessons' : type;
    
    const toTranslate = [];
    for (const item of englishItems) {
        const itemStr = JSON.stringify(item);
        const cacheKey = `${mappedType}_item_${targetLang}_${interfaceLang}_${itemStr}`;
        if (!cache[cacheKey]) {
            toTranslate.push({ item, cacheKey });
        }
    }
    
    if (toTranslate.length === 0) {
        console.log("Nothing to import, cache is already full.");
        process.exit(0);
    }
    
    let translatedArray;
    try {
        let rawContent = fs.readFileSync(extraArg, 'utf8').trim();
        if (rawContent.startsWith('\`\`\`json')) rawContent = rawContent.replace(/^\`\`\`json/, '');
        if (rawContent.startsWith('\`\`\`')) rawContent = rawContent.replace(/^\`\`\`/, '');
        if (rawContent.endsWith('\`\`\`')) rawContent = rawContent.replace(/\`\`\`$/, '');
        translatedArray = JSON.parse(rawContent);
    } catch(e) {
        console.error("Error reading or parsing translated file. Ensure it is valid JSON.");
        console.error(e.message);
        process.exit(1);
    }
    
    if (!Array.isArray(translatedArray) || translatedArray.length !== toTranslate.length) {
        console.error(`Mismatch! We expected ${toTranslate.length} items but the JSON file contained ${translatedArray?.length || 'non-array'} items.`);
        process.exit(1);
    }
    
    let added = 0;
    for (let i = 0; i < toTranslate.length; i++) {
        cache[toTranslate[i].cacheKey] = translatedArray[i];
        added++;
    }
    
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    console.log(`✅ Successfully imported ${added} items into the translation cache!`);

} else {
    console.log("Unknown command. Use 'export' or 'import'.");
}
