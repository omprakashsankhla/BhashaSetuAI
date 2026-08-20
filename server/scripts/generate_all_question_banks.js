const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ override: true });

const apiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const ai = new GoogleGenAI({ apiKey });

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const masterPath = path.join(dataDir, 'questionBank.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const languageNames = {
  hi: 'Hindi',
  bn: 'Bengali',
  mr: 'Marathi',
  mwr: 'Marwadi',
  ta: 'Tamil',
  te: 'Telugu',
  ur: 'Urdu'
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let currentApiKey = apiKey;
let useFallback = false;

async function callGeminiWithRetry(prompt, maxRetries = 10) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const activeApiKey = useFallback && process.env.GEMINI_TUTOR_FALLBACK_API_KEY
        ? process.env.GEMINI_TUTOR_FALLBACK_API_KEY
        : apiKey;

      const activeAi = new GoogleGenAI({ apiKey: activeApiKey });
      const response = await activeAi.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(response.text);
    } catch (err) {
      attempt++;
      const msg = err.message || '';
      console.warn(`[Gemini Error] Attempt ${attempt}/${maxRetries} failed: ${msg}`);

      if (attempt >= maxRetries) throw err;

      // Determine wait delay
      let waitMs = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
      const match = msg.match(/Please retry in ([\d\.]+)s/i);
      if (match) {
        const seconds = parseFloat(match[1]);
        if (!isNaN(seconds)) {
          waitMs = (seconds + 2.5) * 1000; // wait with 2.5s buffer
        }
      }

      // Check if we should swap keys
      const isQuotaError = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('limit');
      if (isQuotaError && process.env.GEMINI_TUTOR_FALLBACK_API_KEY) {
        useFallback = !useFallback;
        console.warn(`[Rate Limit] Swapping active key. UseFallback: ${useFallback}`);
      }

      console.warn(`Waiting ${Math.round(waitMs / 1000)}s before retry...`);
      await delay(waitMs);
    }
  }
}

async function generateLevel(lang, mode, level) {
  const langName = languageNames[lang];
  const levelData = masterData[level];

  // We will process MCQ, Reading, Writing, Grammar, and Puzzle for this level
  const chunk = {
    MCQ: levelData.MCQ || [],
    Reading: levelData.Reading || [],
    Writing: levelData.Writing || [],
    Grammar: levelData.Grammar || [],
    Puzzle: levelData.Puzzle || []
  };

  let prompt = '';
  if (mode === 'A') {
    // Mode A: Learning English, Local interface
    prompt = `You are a professional language teacher. Translate and adapt the following JSON question bank from English to ${langName} (Mode A: Learning English with a ${langName} interface).

Rules for Mode A:
1. Translate all instructions, question texts, prompts, and feedback messages into ${langName}.
2. The core English words, options under test, target English answers, and English reading text (word) must remain in English.
   - For example: if original MCQ is "Which word is a fruit?" with options ["Apple", "Chair", "Table", "Book"], translate the text prompt to ${langName} but keep options as ["Apple", "Chair", "Table", "Book"].
   - For Writing: original text "Apple" -> translated prompt: "Translate into English: सेब" in ${langName}. Expected answer is "Apple".
   - For Grammar: original text "I ___ a student." -> translated prompt: "Fill in the blank: I ___ a student." in ${langName}, keeping English blank. Options remain in English.
3. Keep the JSON structure, keys, IDs, and count of items exactly the same. Do NOT drop any fields.
4. Output strictly valid JSON matching the input schema. Output ONLY raw JSON. No markdown block.

JSON to translate:
${JSON.stringify(chunk, null, 2)}`;
  } else {
    // Mode B: Learning Local language, English interface
    prompt = `You are a professional language teacher. Translate and adapt the following JSON question bank from English to ${langName} (Mode B: Learning ${langName} with an English interface).

Rules for Mode B:
1. Keep all instructions, question texts, prompts, and feedback messages in English (e.g. "Which word means...", "Translate into...", "Fill in the blank...").
2. All core words, options under test, target answers, and reading text (word) must be translated into ${langName} (or are appropriate translations of the tested English words/options into ${langName}).
   - For example: if original is "Which word is a fruit?" with options ["Apple", "Chair", "Table", "Book"], the prompt should be "Which word is a fruit in ${langName}?" and options must be translated to ${langName}.
   - For Writing: original text "Apple" -> prompt: "Translate into ${langName}: Apple", answer: translation of Apple in ${langName}.
   - For Grammar: original text "I ___ a student." -> prompt: "Fill in the blank: [Sentence in ${langName} with blank]" in English. Options and answer must be in ${langName}.
3. Keep the JSON structure, keys, IDs, and count of items exactly the same. Do NOT drop any fields.
4. Output strictly valid JSON matching the input schema. Output ONLY raw JSON. No markdown block.

JSON to translate:
${JSON.stringify(chunk, null, 2)}`;
  }

  return await callGeminiWithRetry(prompt);
}

async function run() {
  const targets = [
    { lang: 'bn', mode: 'A' }, { lang: 'bn', mode: 'B' },
    { lang: 'mr', mode: 'A' }, { lang: 'mr', mode: 'B' },
    { lang: 'mwr', mode: 'A' }, { lang: 'mwr', mode: 'B' },
    { lang: 'ta', mode: 'A' }, { lang: 'ta', mode: 'B' },
    { lang: 'te', mode: 'A' }, { lang: 'te', mode: 'B' },
    { lang: 'ur', mode: 'A' }, { lang: 'ur', mode: 'B' }
  ];

  for (const target of targets) {
    const filename = target.mode === 'A' 
      ? `questionBank_${target.lang}.json`
      : `questionBank_${target.mode === 'B' ? `${target.lang}_learning` : target.lang}.json`;

    console.log(`\n========================================`);
    console.log(`Starting generation for: ${filename}`);
    console.log(`========================================`);

    const resultData = {};
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    for (const lvl of levels) {
      console.log(`Generating level ${lvl}...`);
      try {
        const translatedLevel = await generateLevel(target.lang, target.mode, lvl);
        resultData[lvl] = translatedLevel;
        console.log(`Level ${lvl} done.`);
        // Sleep to avoid rate limiting
        await delay(5000);
      } catch (err) {
        console.error(`Fatal error on language ${target.lang} level ${lvl}:`, err);
        process.exit(1);
      }
    }

    const outputPath = path.join(dataDir, filename);
    fs.writeFileSync(outputPath, JSON.stringify(resultData, null, 2), 'utf8');
    console.log(`Saved successfully to: ${outputPath}`);
  }

  console.log('\nAll question banks updated successfully!');
}

run();
