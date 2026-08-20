const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const masterPath = path.join(__dirname, '../data/questionBank.json');
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

const googleTranslateCodes = {
  hi: 'hi',
  bn: 'bn',
  mr: 'mr',
  ta: 'ta',
  te: 'te',
  ur: 'ur'
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Call Google Translate Free API for a batch of strings
async function translateBatch(strings, targetLang) {
  if (strings.length === 0) return [];
  
  // Format with numbered delimiters to keep order and prevent line merging
  const textToTranslate = strings.map((str, idx) => `${idx + 1} ||| ${str}`).join('\n');
  
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Translate HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!data || !data[0]) {
      throw new Error('Invalid translation response format');
    }
    
    // Combine all translated parts
    const fullText = data[0].map(part => part[0]).join('');
    
    // Parse back using the regex
    const translatedList = new Array(strings.length);
    for (const match of fullText.matchAll(/^(\d+)\s*\|\|\|\s*(.*)$/gm)) {
      const idx = parseInt(match[1], 10) - 1;
      if (idx >= 0 && idx < strings.length) {
        translatedList[idx] = match[2].trim();
      }
    }
    
    // Fill in any gaps with the original strings as fallback
    for (let i = 0; i < strings.length; i++) {
      if (translatedList[i] === undefined || translatedList[i] === null) {
        translatedList[i] = strings[i];
      }
    }
    
    return translatedList;
  } catch (err) {
    console.error(`[Error] Batch translation failed for ${targetLang}:`, err.message);
    // Fallback: return original strings
    return strings;
  }
}

// Helper: Translate a list of strings with chunking to avoid request size limits
async function translateAllStrings(strings, targetLang) {
  const uniqueStrings = Array.from(new Set(strings.filter(s => s && typeof s === 'string' && s.trim().length > 0)));
  console.log(`Translating ${uniqueStrings.length} unique strings to ${targetLang}...`);
  
  const translations = {};
  const batchSize = 40;
  
  for (let i = 0; i < uniqueStrings.length; i += batchSize) {
    const batch = uniqueStrings.slice(i, i + batchSize);
    console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uniqueStrings.length / batchSize)}`);
    const results = await translateBatch(batch, targetLang);
    for (let j = 0; j < batch.length; j++) {
      translations[batch[j]] = results[j];
    }
    await delay(300); // Small rate limit delay
  }
  
  return translations;
}

// Call Gemini API with Retry (Specifically for Marwadi 'mwr')
async function callGeminiWithRetry(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
  const fallbackKey = process.env.GEMINI_TUTOR_FALLBACK_API_KEY;
  let useFallback = false;
  
  const ai = new GoogleGenAI({ apiKey });
  const aiFallback = fallbackKey ? new GoogleGenAI({ apiKey: fallbackKey }) : null;

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const activeAi = (useFallback && aiFallback) ? aiFallback : ai;
      const response = await activeAi.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text.trim());
    } catch (err) {
      const msg = err.message || '';
      console.warn(`[Gemini Error] Attempt ${attempt} failed: ${msg}`);
      if (attempt === 5) throw err;
      
      const isQuotaError = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('limit');
      if (isQuotaError && fallbackKey) {
        useFallback = !useFallback;
        console.warn(`[Rate Limit] Swapping active key. UseFallback: ${useFallback}`);
      }
      
      const waitMs = 5000 * attempt;
      console.warn(`Waiting ${waitMs / 1000}s before retry...`);
      await delay(waitMs);
    }
  }
}

// Generate level for Marwadi 'mwr' using Gemini
async function generateLevelGemini(lang, mode, level) {
  const langName = languageNames[lang];
  const levelData = masterData[level];
  const chunk = {
    MCQ: levelData.MCQ || [],
    Reading: levelData.Reading || [],
    Writing: levelData.Writing || [],
    Grammar: levelData.Grammar || [],
    Puzzle: levelData.Puzzle || []
  };

  let prompt = '';
  if (mode === 'A') {
    prompt = `You are a professional language teacher. Translate and adapt the following JSON question bank from English to ${langName} (Mode A: Learning English with a ${langName} interface).

Rules for Mode A:
1. Translate all instructions, question texts, prompts, and feedback messages into ${langName}.
2. The core English words, options under test, target English answers, and English reading text (word) must remain in English.
3. Keep the JSON structure, keys, IDs, and count of items exactly the same. Do NOT drop any fields.
4. Output strictly valid JSON matching the input schema. Output ONLY raw JSON. No markdown block.

JSON to translate:
${JSON.stringify(chunk, null, 2)}`;
  } else {
    prompt = `You are a professional language teacher. Translate and adapt the following JSON question bank from English to ${langName} (Mode B: Learning ${langName} with an English interface).

Rules for Mode B:
1. Keep all instructions, question texts, prompts, and feedback messages in English.
2. All core words, options under test, target answers, and reading text (word) must be translated into ${langName}.
3. Keep the JSON structure, keys, IDs, and count of items exactly the same. Do NOT drop any fields.
4. Output strictly valid JSON matching the input schema. Output ONLY raw JSON. No markdown block.

JSON to translate:
${JSON.stringify(chunk, null, 2)}`;
  }

  return await callGeminiWithRetry(prompt);
}

// Global cache for translated maps: { [langCode]: { [englishString]: targetString } }
const translationsCache = {};

// Main logic to translate all question banks
async function run() {
  const targets = [
    { lang: 'bn', mode: 'A' }, { lang: 'bn', mode: 'B' },
    { lang: 'mr', mode: 'A' }, { lang: 'mr', mode: 'B' },
    { lang: 'mwr', mode: 'A' }, { lang: 'mwr', mode: 'B' },
    { lang: 'ta', mode: 'A' }, { lang: 'ta', mode: 'B' },
    { lang: 'te', mode: 'A' }, { lang: 'te', mode: 'B' },
    { lang: 'ur', mode: 'A' }, { lang: 'ur', mode: 'B' },
    { lang: 'hi', mode: 'B' } // hi Mode A is already fully translated
  ];

  // Collect all unique strings from master data
  const allMasterStrings = [];
  for (const level in masterData) {
    for (const type in masterData[level]) {
      for (const item of masterData[level][type]) {
        if (item.text) allMasterStrings.push(item.text);
        if (item.feedback) allMasterStrings.push(item.feedback);
        if (item.word) allMasterStrings.push(item.word);
        if (item.answer) allMasterStrings.push(item.answer);
        if (item.options) allMasterStrings.push(...item.options);
      }
    }
  }

  // Pre-load static translations for interface commands
  const interfaceCommands = {
    'Translate into English': {
      hi: 'अंग्रेजी में अनुवाद करें',
      bn: 'ইংরেজিতে অনুবাদ করুন',
      mr: 'इंग्रजीत भाषांतर करा',
      ta: 'ஆங்கிலத்தில் மொழிபெயர்க்கவும்',
      te: 'ఆంగ్లంలోకి అనువదించండి',
      ur: 'انگریزی میں ترجمہ کریں۔'
    },
    'The phrase was': {
      hi: 'वाक्यांश था',
      bn: 'বাক্যাংশটি ছিল',
      mr: 'वाक्य होते',
      ta: 'சொற்றொடர்',
      te: 'పదం',
      ur: 'جملہ تھا'
    },
    'Fill in the blank': {
      hi: 'रिक्त स्थान भरें',
      bn: 'শূন্যস্থান পূরণ করুন',
      mr: 'रिक्त जागा भरा',
      ta: 'கோடிட்ட இடங்களை நிரப்புக',
      te: 'ఖాళీని పూరించండి',
      ur: 'خالی جگہ پُر کریں'
    },
    'Correct answer is': {
      hi: 'सही उत्तर है',
      bn: 'সঠিক উত্তর হল',
      mr: 'योग्य उत्तर आहे',
      ta: 'சரியான பதில்',
      te: 'సరైన సమాధానం',
      ur: 'درست جواب ہے'
    },
    'Read aloud': {
      hi: 'ज़ोर से पढ़ें',
      bn: 'জোরে পড়ুন',
      mr: 'मोठ्याने वाचा',
      ta: 'சத்தமாக வாசிக்கவும்',
      te: 'గట్టిగా చదవండి',
      ur: 'اونچی آواز میں پڑھیں'
    }
  };

  for (const target of targets) {
    console.log(`\n========================================`);
    console.log(`Processing: ${target.lang} - Mode ${target.mode}`);
    console.log(`========================================`);

    const fileName = `questionBank_${target.mode === 'B' ? `${target.lang}_learning` : target.lang}.json`;
    const outputPath = path.join(__dirname, '../data', fileName);

    // If target is Marwadi (mwr), use Gemini
    if (target.lang === 'mwr') {
      try {
        const outputData = {};
        for (const level of ['Beginner', 'Intermediate', 'Advanced']) {
          console.log(`Translating level ${level} for Marwadi using Gemini...`);
          outputData[level] = await generateLevelGemini(target.lang, target.mode, level);
          await delay(2000); // Cool down delay
        }
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
        console.log(`[Success] Written Marwadi file to ${outputPath}`);
      } catch (err) {
        console.error(`[Error] Gemini generation failed for Marwadi:`, err.message);
      }
      continue;
    }

    // Otherwise, translate programmatically using Google Translate Free API
    const gtLang = googleTranslateCodes[target.lang];
    let transMap = translationsCache[gtLang];
    if (!transMap) {
      transMap = await translateAllStrings(allMasterStrings, gtLang);
      translationsCache[gtLang] = transMap;
    } else {
      console.log(`Reusing cached translation map for: ${target.lang}`);
    }

    // Also translate basic command strings to target language for Mode A
    const localCommands = {};
    for (const key in interfaceCommands) {
      localCommands[key] = interfaceCommands[key][target.lang] || transMap[key] || key;
    }

    const outputData = {};

    for (const level of ['Beginner', 'Intermediate', 'Advanced']) {
      outputData[level] = {};
      const levelData = masterData[level];

      for (const type of ['MCQ', 'Reading', 'Writing', 'Grammar', 'Puzzle']) {
        const items = levelData[type] || [];
        outputData[level][type] = [];

        for (const item of items) {
          const newItem = { ...item };

          if (target.mode === 'A') {
            // Mode A: Learning English, Local Interface
            if (type === 'MCQ') {
              newItem.text = transMap[item.text] || item.text;
              newItem.feedback = transMap[item.feedback] || item.feedback;
            } else if (type === 'Reading') {
              newItem.text = `${localCommands['Read aloud']}: ${item.word}`;
            } else if (type === 'Writing') {
              const transWord = transMap[item.text] || item.text;
              newItem.text = `${localCommands['Translate into English']}: ${transWord}`;
              newItem.feedback = `${localCommands['The phrase was']}: ${item.text}`;
            } else if (type === 'Grammar') {
              newItem.text = `${localCommands['Fill in the blank']}: ${item.text}`;
              newItem.feedback = `${localCommands['Correct answer is']}: ${item.answer}`;
            } else if (type === 'Puzzle') {
              newItem.text = transMap[item.text] || item.text;
              newItem.feedback = `${localCommands['Correct answer is']}: ${item.answer}`;
            }
          } else {
            // Mode B: Learning Local Language, English Interface
            const langName = languageNames[target.lang];
            
            if (type === 'MCQ') {
              newItem.text = item.text.replace(/fruit|animal|color|day of the week|vegetable|drink|month of the year|vehicle|shape|professional role/g, match => `${match} in ${langName}`);
              newItem.options = item.options.map(opt => transMap[opt] || opt);
              
              // Map correct answer to the translated option
              const correctIdx = item.options.indexOf(item.answer);
              if (correctIdx !== -1) {
                newItem.answer = newItem.options[correctIdx];
              } else {
                newItem.answer = transMap[item.answer] || item.answer;
              }
              newItem.feedback = `Correct answer is: ${newItem.answer}`;
            } else if (type === 'Reading') {
              const transWord = transMap[item.word] || item.word;
              newItem.text = `Read aloud: ${transWord}`;
              newItem.word = transWord;
            } else if (type === 'Writing') {
              newItem.text = `Translate into ${langName}: ${item.text}`;
              newItem.answer = transMap[item.text] || item.text;
              newItem.feedback = `Correct translation is: ${newItem.answer}`;
            } else if (type === 'Grammar') {
              // Substitute answer, translate full sentence, replace answer with blank
              const fullSentence = item.text.replace('_____', item.answer).replace('___', item.answer);
              const transFull = transMap[fullSentence] || fullSentence;
              const transAns = transMap[item.answer] || item.answer;
              
              newItem.text = `Fill in the blank: ${transFull.replace(transAns, '___')}`;
              newItem.options = item.options.map(opt => transMap[opt] || opt);
              
              const correctIdx = item.options.indexOf(item.answer);
              if (correctIdx !== -1) {
                newItem.answer = newItem.options[correctIdx];
              } else {
                newItem.answer = transAns;
              }
              newItem.feedback = `Correct answer is: ${newItem.answer}`;
            } else if (type === 'Puzzle') {
              newItem.text = item.text;
              newItem.options = item.options.map(opt => transMap[opt] || opt);
              
              const correctIdx = item.options.indexOf(item.answer);
              if (correctIdx !== -1) {
                newItem.answer = newItem.options[correctIdx];
              } else {
                newItem.answer = transMap[item.answer] || item.answer;
              }
              newItem.feedback = `Correct answer is: ${newItem.answer}`;
            }
          }

          outputData[level][type].push(newItem);
        }
      }
    }

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`[Success] Written file to ${outputPath}`);
  }

  console.log('\n========================================');
  console.log('All Question Banks generated successfully!');
  console.log('========================================');
}

run().catch(console.error);
