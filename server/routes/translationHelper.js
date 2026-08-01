const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ override: true });

const apiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const ai = new GoogleGenAI({ apiKey });

const fs = require('fs');
const path = require('path');

async function generateContentWithRetry(options, maxRetries = 6) {
  let attempt = 0;
  let useFallbackKey = false;
  while (attempt < maxRetries) {
    try {
      let currentAi = ai;
      if (useFallbackKey && process.env.GEMINI_TUTOR_FALLBACK_API_KEY) {
        currentAi = new GoogleGenAI({ apiKey: process.env.GEMINI_TUTOR_FALLBACK_API_KEY });
      }
      return await currentAi.models.generateContent(options);
    } catch (err) {
      attempt++;
      const msg = err.message || '';
      const isRateLimitOrUnavailable = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('quota');
      
      if (isRateLimitOrUnavailable && attempt < maxRetries) {
        if (!useFallbackKey && process.env.GEMINI_TUTOR_FALLBACK_API_KEY) {
          console.warn(`[API Demand Limit] Rate limit hit on primary key. Swapping to fallback key...`);
          useFallbackKey = true;
          continue; // retry immediately
        }

        let delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // default backoff
        
        // Extract exact retry seconds if present in error message
        const match = msg.match(/Please retry in ([\d\.]+)s/i);
        if (match) {
          const seconds = parseFloat(match[1]);
          if (!isNaN(seconds)) {
            delay = (seconds + 2) * 1000; // wait seconds + 2s buffer
          }
        }
        
        console.warn(`[API Demand Limit] Rate limit hit on fallback key. Waiting ${Math.round(delay)}ms before retry... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

const languageNames = {
  en: 'English',
  hi: 'Hindi',
  mwr: 'Marwadi',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
  mr: 'Marathi',
  ur: 'Urdu'
};

const cachePath = path.join(__dirname, '../data/translation_cache.json');
let initialCache = {};
if (fs.existsSync(cachePath)) {
  try {
    initialCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch(e) {
    console.error('Failed to parse translation cache:', e);
  }
}
const cache = new Map(Object.entries(initialCache));

const activeTranslations = new Map();

async function translateOrAdaptContent(content, targetLang, interfaceLang, type, isOffline = false) {
  const targetLangName = languageNames[targetLang] || 'Hindi';
  const interfaceLangName = languageNames[interfaceLang] || 'English';

  if (Array.isArray(content)) {
    const cachedResults = [];
    const toTranslate = [];

    for (const item of content) {
      const itemStr = JSON.stringify(item);
      const cacheKey = `${type}_item_${targetLang}_${interfaceLang}_${itemStr}`;
      if (cache.has(cacheKey)) {
        cachedResults.push({ item, translated: cache.get(cacheKey) });
      } else {
        toTranslate.push({ item, cacheKey });
      }
    }

    let newlyTranslated = [];
    if (toTranslate.length > 0) {
      const itemsToTranslate = toTranslate.map(t => t.item);
      const batchKey = `${type}_${targetLang}_${interfaceLang}_${JSON.stringify(itemsToTranslate)}`;

      let promise;
      if (activeTranslations.has(batchKey)) {
        promise = activeTranslations.get(batchKey);
      } else {
        promise = (async () => {
          console.warn(`[RUNTIME CACHE MISS] Translating/Adapting ${toTranslate.length} missing items for ${type} to Learning: ${targetLangName}, Interface: ${interfaceLangName}`);
          
          let prompt = '';
          if (type === 'assessment' || type === 'lessons') {
            prompt = `You are a professional language teacher. Translate and adapt the following JSON content of learning activities.
            
Target Learning Language: ${targetLangName} (The content to be learned, like words to read, options to pick, correct answers, writing prompts).
User's Interface/Instruction Language: ${interfaceLangName} (The instructions, feedback, question prompts, e.g., "Translate this word", "Read this out loud").

Ensure that:
1. All instruction text, question prompts, and feedback strings are translated into ${interfaceLangName}.
2. All vocabulary words under test, correct answers, reading text (word), and options are written in ${targetLangName} (or are appropriate translations to/from ${targetLangName} matching the question context).
3. Do NOT change the JSON structure, keys, number of items, or types.
4. Output ONLY the raw JSON matching the structure. Do not wrap in markdown \`\`\`json blocks.

JSON to translate:
${JSON.stringify(itemsToTranslate, null, 2)}`;
          } else if (type === 'lesson_meta') {
            prompt = `Translate the following JSON array containing lesson titles.
Target Learning Language: ${targetLangName}
User's Interface Language: ${interfaceLangName}

Ensure that all values (lesson titles) are translated into the user's interface language (${interfaceLangName}) so the learner can understand them.
Do NOT change the JSON structure or keys.
Output strictly valid JSON matching the input schema. No markdown formatting.
JSON:
${JSON.stringify(itemsToTranslate, null, 2)}`;
          } else {
            prompt = `Translate and adapt the following JSON array.
Target Learning Language: ${targetLangName}
User's Interface Language: ${interfaceLangName}

Output strictly valid JSON matching the input schema. No markdown formatting.
JSON:
${JSON.stringify(itemsToTranslate, null, 2)}`;
          }

          try {
            const maxRetries = isOffline ? 6 : 1; // runtime fails fast
            const timeoutMs = isOffline ? 600000 : 5000; // 5s timeout at runtime

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Gemini translation request timed out')), timeoutMs)
            );

            const apiPromise = generateContentWithRetry({
              model: 'gemini-3.6-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
            }, maxRetries);

            const response = await Promise.race([apiPromise, timeoutPromise]);

            let rawText = response.text.trim();
            const firstBracket = rawText.indexOf('[');
            const firstBrace = rawText.indexOf('{');
            let startIdx = -1;
            let endIdx = -1;
            if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
              startIdx = firstBracket; endIdx = rawText.lastIndexOf(']');
            } else if (firstBrace !== -1) {
              startIdx = firstBrace; endIdx = rawText.lastIndexOf('}');
            }
            if (startIdx !== -1 && endIdx !== -1) rawText = rawText.substring(startIdx, endIdx + 1);

            const parsedArray = JSON.parse(rawText);
            if (Array.isArray(parsedArray) && parsedArray.length === itemsToTranslate.length) {
              for (let i = 0; i < toTranslate.length; i++) {
                cache.set(toTranslate[i].cacheKey, parsedArray[i]);
              }
              saveCache();
              return parsedArray;
            } else {
              console.warn(`Translation array length mismatch for ${type}, returning original items`);
              return itemsToTranslate;
            }
          } catch (err) {
            console.error(`AI Translation failed for ${type} items:`, err.message);
            return itemsToTranslate;
          } finally {
            activeTranslations.delete(batchKey);
          }
        })();

        activeTranslations.set(batchKey, promise);
      }

      newlyTranslated = await promise;
    }

    const finalResult = [];
    let translateIdx = 0;
    for (const item of content) {
      const cached = cachedResults.find(c => c.item === item);
      if (cached) {
        finalResult.push(cached.translated);
      } else {
        finalResult.push(newlyTranslated[translateIdx++] || item);
      }
    }
    return finalResult;
  }

  // Non-array translation fallback
  const cacheKey = `${type}_${targetLang}_${interfaceLang}_${JSON.stringify(content)}`;
  if (cache.has(cacheKey)) {
    console.log(`[Cache Hit] Returning cached translations for ${type} (${targetLang} -> ${interfaceLang})`);
    return cache.get(cacheKey);
  }

  console.log(`[Cache Miss] Translating/Adapting ${type} content to Learning: ${targetLangName}, Interface: ${interfaceLangName}`);

  let prompt = '';

  if (type === 'assessment' || type === 'lessons') {
    prompt = `You are a professional language teacher. Translate and adapt the following JSON content of learning activities.
    
Target Learning Language: ${targetLangName} (The content to be learned, like words to read, options to pick, correct answers, writing prompts).
User's Interface/Instruction Language: ${interfaceLangName} (The instructions, feedback, question prompts, e.g., "Translate this word", "Read this out loud").

Ensure that:
1. All instruction text, question prompts, and feedback strings are translated into ${interfaceLangName}.
2. All vocabulary words under test, correct answers, reading text (word), and options are written in ${targetLangName} (or are appropriate translations to/from ${targetLangName} matching the question context).
3. Do NOT change the JSON structure, keys, number of items, or types.
4. Output ONLY the raw JSON matching the structure. Do not wrap in markdown \`\`\`json blocks.

JSON to translate:
${JSON.stringify(content, null, 2)}`;
  } else if (type === 'picture-match') {
    prompt = `You are a professional language teacher. Translate and adapt this vocabulary match bank.
    
Target Learning Language: ${targetLangName}
User's Interface/Instruction Language: ${interfaceLangName}

Ensure that:
1. "word_target" must be translated/written in ${targetLangName}.
2. "word_english" must be translated/written in ${interfaceLangName}.
3. "category" must be written in ${interfaceLangName}.
4. Maintain the exact JSON array structure.
5. Output ONLY the raw JSON. No markdown blocks.

JSON to translate:
${JSON.stringify(content, null, 2)}`;
  } else {
    // Generic fallback prompt
    prompt = `Translate and adapt the following JSON data.
Target Learning Language: ${targetLangName}
User's Interface Language: ${interfaceLangName}

Output strictly valid JSON matching the input schema. No markdown formatting.
JSON:
${JSON.stringify(content, null, 2)}`;
  }

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let rawText = response.text.trim();
    const firstBracket = rawText.indexOf('[');
    const firstBrace = rawText.indexOf('{');
    let startIdx = -1;
    let endIdx = -1;
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket; endIdx = rawText.lastIndexOf(']');
    } else if (firstBrace !== -1) {
      startIdx = firstBrace; endIdx = rawText.lastIndexOf('}');
    }
    if (startIdx !== -1 && endIdx !== -1) rawText = rawText.substring(startIdx, endIdx + 1);


    const parsed = JSON.parse(rawText);
    cache.set(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.error(`AI Translation failed for ${type}:`, err.message);
    // If translation fails, return the original content as a fallback
    return content;
  }
}

// Generates game data dynamically using AI if a game list is not pre-defined
async function generateGameData(gameType, targetLang, interfaceLang) {
  const targetLangName = languageNames[targetLang] || 'Hindi';
  const interfaceLangName = languageNames[interfaceLang] || 'English';

  const cacheKey = `game_${gameType}_${targetLang}_${interfaceLang}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  console.log(`[Cache Miss] Generating game data for ${gameType} (Learning: ${targetLangName}, Interface: ${interfaceLangName})`);

  let prompt = '';
  let schema = null;

  if (gameType === 'wordsprint') {
    prompt = `Generate a JSON object containing a list of 15 common words/phrases for a vocabulary typing game.
The user is learning ${targetLangName} and speaks ${interfaceLangName}.
Each item should have:
- "target": The word/phrase in ${targetLangName} (written in its native script).
- "translation": The translation in ${interfaceLangName}.

Example JSON output structure:
{
  "words": [
    { "target": "नमस्ते", "translation": "hello" }
  ]
}`;
  } else if (gameType === 'shopkeeper') {
    prompt = `Generate a JSON object for a shopkeeper roleplay game.
The user is learning ${targetLangName} and speaks ${interfaceLangName}.
Generate:
1. "items": An array of exactly 3 bazaar items (fruits, vegetables, objects) containing:
   - "name": The item name in ${targetLangName}.
   - "price": An integer price between 5 and 30.
   - "emoji": A matching food/object emoji (must be exactly 🍅 for first item, 🥔 for second item, and 🧅 for third item).
2. "customers": An array of 3 customer requests. Each request should have:
   - "dialogue": A polite dialogue in ${targetLangName} spoken by the customer requesting a combination of 1 or 2 of the items. E.g., "Hello! Please give me 2 kg tomatoes and 1 kg onions." written in ${targetLangName}'s native script.
   - "targetTomatoes": Quantity of the first item (at index 0, emoji 🍅) requested.
   - "targetPotatoes": Quantity of the second item (at index 1, emoji 🥔) requested.
   - "targetOnions": Quantity of the third item (at index 2, emoji 🧅) requested.
   - "bill": The exact total cost based on the prices of the requested items.

Example JSON output structure:
{
  "items": [
    { "name": "टमाटर", "price": 20, "emoji": "🍅" },
    { "name": "आलू", "price": 10, "emoji": "🥔" },
    { "name": "प्याज़", "price": 15, "emoji": "🧅" }
  ],
  "customers": [
    { "dialogue": "नमस्ते! मुझे 2 किलो टमाटर और 1 किलो आलू चाहिए।", "targetTomatoes": 2, "targetPotatoes": 1, "targetOnions": 0, "bill": 50 }
  ]
}`;
  } else if (gameType === 'signreader') {
    prompt = `Generate a JSON object containing a list of 5 common public/road signs in ${targetLangName} for a sign reading game.
The user is learning ${targetLangName} and speaks ${interfaceLangName}.
Each item should have:
- "sign": A sign board text written in ${targetLangName}'s native script (e.g., "प्रवेश निषेध", "धूम्रपान वर्जित").
- "type": "danger" | "warning" | "info".
- "options": An array of 4 English/Interface language options explaining the sign.
- "answer": The correct English option explaining the sign.

Example JSON output structure:
{
  "signs": [
    { "sign": "प्रवेश निषेध", "type": "danger", "options": ["No Entry", "Exit", "One Way", "Caution"], "answer": "No Entry" }
  ]
}`;
  } else if (gameType === 'textdetective') {
    prompt = `Generate a JSON object containing a list of 4 sentence correction puzzles in ${targetLangName} for a grammar game.
The user is learning ${targetLangName} and speaks ${interfaceLangName}.
Each item should have:
- "sentenceParts": An array of strings splitting the sentence, where one of the parts contains a grammar/spelling mistake (e.g. ["यह ", "मेरे ", "किताब है।"]).
- "wrongIdx": The 0-based index of the parts containing the wrong word (e.g. 1).
- "wrongWord": The wrong word string.
- "options": An array of 4 correction options.
- "correctAnswer": The correct word to replace the mistake (e.g. "मेरी ").
- "explanation": A brief 1-sentence grammatical explanation in ${interfaceLangName} explaining why this correction is correct.

Example JSON output structure:
{
  "puzzles": [
    { "sentenceParts": ["यह ", "मेरे ", "किताब है।"], "wrongIdx": 1, "wrongWord": "मेरे ", "options": ["मेरी ", "मेरा ", "मैं ", "मुझे "], "correctAnswer": "मेरी ", "explanation": "Book is feminine, so 'मेरी' is correct." }
  ]
}`;
  }

  try {
    const response = await generateContentWithRetry({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let rawText = response.text.trim();
    const firstBracket = rawText.indexOf('[');
    const firstBrace = rawText.indexOf('{');
    let startIdx = -1;
    let endIdx = -1;
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket; endIdx = rawText.lastIndexOf(']');
    } else if (firstBrace !== -1) {
      startIdx = firstBrace; endIdx = rawText.lastIndexOf('}');
    }
    if (startIdx !== -1 && endIdx !== -1) rawText = rawText.substring(startIdx, endIdx + 1);


    const parsed = JSON.parse(rawText);
    cache.set(cacheKey, parsed);
    saveCache();
    return parsed;
  } catch (err) {
    console.error(`AI Game Generation failed for ${gameType}:`, err.message);
    return null;
  }
}

module.exports = {
  translateOrAdaptContent,
  generateGameData
};
