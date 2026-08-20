const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
const cacheService = require('../services/redisClient');
require('dotenv').config({ override: true });

const apiKey = process.env.OPENAI_API_KEY || 'MISSING_API_KEY';
const openai = new OpenAI({ apiKey });

const geminiApiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const gemini = new GoogleGenAI({ apiKey: geminiApiKey });

const fs = require('fs');
const path = require('path');

async function generateContentWithRetry(options, maxRetries = 6) {
  const modelName = options.model || 'gpt-4o-mini';
  const isGemini = modelName.startsWith('gemini');
  let attempt = 0;
  let useFallbackKey = false;
  
  while (attempt < maxRetries) {
    try {
      if (isGemini) {
        let currentGemini = gemini;
        if (useFallbackKey && process.env.GEMINI_FALLBACK_API_KEY) {
          currentGemini = new GoogleGenAI({ apiKey: process.env.GEMINI_FALLBACK_API_KEY });
        }
        
        const response = await currentGemini.models.generateContent({
          model: modelName,
          contents: options.contents,
          config: options.config || {}
        });
        
        return {
          text: response.text
        };
      } else {
        let currentAi = openai;
        if (useFallbackKey && process.env.OPENAI_FALLBACK_API_KEY) {
          currentAi = new OpenAI({ apiKey: process.env.OPENAI_FALLBACK_API_KEY });
        }
        const response = await currentAi.chat.completions.create({
          model: modelName,
          messages: [{ role: 'user', content: options.contents }],
          response_format: options.config && options.config.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined
        });
        return {
          text: response.choices[0].message.content
        };
      }
    } catch (err) {
      attempt++;
      const msg = err.message || '';
      const isRateLimitOrUnavailable = msg.includes('429') || msg.includes('503') || msg.includes('quota') || msg.includes('Too Many Requests') || msg.includes('exhausted') || msg.includes('demand');
      
      if (isRateLimitOrUnavailable && attempt < maxRetries) {
        if (isGemini) {
          if (!useFallbackKey && process.env.GEMINI_FALLBACK_API_KEY) {
            console.warn(`[API Demand Limit] Rate limit hit on primary Gemini key. Swapping to fallback key...`);
            useFallbackKey = true;
            continue; // retry immediately
          }
        } else {
          if (!useFallbackKey && process.env.OPENAI_FALLBACK_API_KEY) {
            console.warn(`[API Demand Limit] Rate limit hit on primary OpenAI key. Swapping to fallback key...`);
            useFallbackKey = true;
            continue; // retry immediately
          }
        }

        let delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`[API Demand Limit] Rate limit hit. Waiting ${Math.round(delay)}ms before retry... (Attempt ${attempt}/${maxRetries})`);
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

function saveCache() {
  try {
    fs.writeFileSync(cachePath, JSON.stringify(Object.fromEntries(cache), null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save translation cache:', err);
  }
}

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
      
      let cachedVal = cache.get(cacheKey);
      if (!cachedVal) {
        cachedVal = await cacheService.get(cacheKey);
        if (cachedVal) {
          try {
            const parsed = typeof cachedVal === 'string' ? JSON.parse(cachedVal) : cachedVal;
            cache.set(cacheKey, parsed);
            cachedVal = parsed;
          } catch (e) {
            cachedVal = null;
          }
        }
      }

      if (cachedVal) {
        cachedResults.push({ item, translated: cachedVal });
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
          if (!isOffline && process.env.ALLOW_RUNTIME_TRANSLATION !== 'true') {
            console.warn(`[RUNTIME CACHE MISS] Missing translations for ${type} (${targetLang} -> ${interfaceLang}). Runtime AI translation is disabled to prevent rate-limiting. Falling back to original.`);
            return itemsToTranslate;
          }
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
          } else if (type === 'conversation-sim') {
            prompt = `You are a professional language teacher. Translate and adapt this JSON array containing conversation simulation scenarios.
Target Learning Language (which the user is learning and MUST practice speaking): ${targetLangName}
User's Interface/Instruction Language (which the user understands and uses to read scenario descriptions): ${interfaceLangName}

Ensure that:
1. Translate "title" into ${interfaceLangName} (so the user knows the scenario in their native language).
2. Translate "initialMessage" into ${targetLangName} (the chatbot MUST start the conversation speaking in ${targetLangName}).
3. Adapt "systemPrompt" (the instructions to the AI chatbot) so that it says in English: "You are [role]. You MUST converse ONLY in ${targetLangName}. Help the user... keep your responses concise, and use natural B1-level ${targetLangName} vocabulary and sentence structures."
4. Do NOT change the JSON structure, keys, number of items, or types.
5. Output strictly valid JSON matching the input schema. Output ONLY raw JSON.

JSON:
${JSON.stringify(itemsToTranslate, null, 2)}`;
          } else if (type === 'audio-comp') {
            prompt = `You are a professional language teacher. Translate and adapt this JSON array of audio comprehension tasks.
Target Learning Language (which the user is learning to listen to): ${targetLangName}
User's Interface/Instruction Language (which the user uses to read questions and options): ${interfaceLangName}

Ensure that:
1. Translate "title" into ${interfaceLangName}.
2. Translate "transcript" into ${targetLangName} (since the user will hear/read the listening announcement in ${targetLangName}).
3. In "questions" array, for each question object:
   - Translate "question" into ${interfaceLangName}.
   - Translate all options in the "options" array into ${interfaceLangName}.
   - Translate "answer" into ${interfaceLangName} (matching the correct option).
4. Do NOT change the JSON structure, keys, number of items, or types.
5. Output strictly valid JSON matching the input schema. Output ONLY raw JSON.

JSON:
${JSON.stringify(itemsToTranslate, null, 2)}`;
          } else if (type === 'speech-prep') {
            prompt = `You are a professional language teacher. Translate and adapt this JSON array of speech preparation tasks.
Target Learning Language (the language the user is learning to speak): ${targetLangName}
User's Interface/Instruction Language (the language of the instructions and tips): ${interfaceLangName}

Ensure that:
1. Translate "topic" into ${interfaceLangName} (so the user understands what to speak about).
2. Translate all items in the "tips" array into ${interfaceLangName} (so the user gets instructions and suggestions in their native language).
3. Do NOT change the JSON structure, keys, number of items, or types.
4. Output strictly valid JSON matching the input schema. Output ONLY raw JSON.

JSON:
${JSON.stringify(itemsToTranslate, null, 2)}`;
          } else if (type === 'article-translation') {
            prompt = `You are a professional language teacher. Translate and adapt this JSON array of article translation tasks.
Target Learning Language (the language of the article to be translated): ${targetLangName}
User's Interface/Instruction Language: ${interfaceLangName}

Ensure that:
1. Translate "title" into ${targetLangName} (the article title).
2. Translate "text" into ${targetLangName} (the article content which the user will read and translate).
3. Do NOT change the JSON structure, keys, number of items, or types.
4. Output strictly valid JSON matching the input schema. Output ONLY raw JSON.

JSON:
${JSON.stringify(itemsToTranslate, null, 2)}`;
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
              model: 'gemini-3.5-flash',
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
                await cacheService.set(toTranslate[i].cacheKey, JSON.stringify(parsedArray[i]), 30 * 24 * 3600);
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

  if (!isOffline && process.env.ALLOW_RUNTIME_TRANSLATION !== 'true') {
    console.warn(`[RUNTIME CACHE MISS] Runtime AI translation is disabled. Falling back to original content for ${type}.`);
    return content;
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
  } else if (type === 'conversation-sim') {
    prompt = `You are a professional language teacher. Translate and adapt this JSON object containing conversation simulation scenarios.
Target Learning Language (which the user is learning and MUST practice speaking): ${targetLangName}
User's Interface/Instruction Language (which the user understands and uses to read scenario descriptions): ${interfaceLangName}

Ensure that:
1. Translate "title" into ${interfaceLangName}.
2. Translate "initialMessage" into ${targetLangName}.
3. Adapt "systemPrompt" (the instructions to the AI chatbot) so that it says in English: "You are [role]. You MUST converse ONLY in ${targetLangName}. Help the user... keep your responses concise, and use natural B1-level ${targetLangName} vocabulary and sentence structures."
4. Do NOT change the JSON structure or keys.
5. Output strictly valid JSON.

JSON:
${JSON.stringify(content, null, 2)}`;
  } else if (type === 'audio-comp') {
    prompt = `You are a professional language teacher. Translate and adapt this JSON object of audio comprehension tasks.
Target Learning Language (which the user is learning to listen to): ${targetLangName}
User's Interface/Instruction Language (which the user uses to read questions and options): ${interfaceLangName}

Ensure that:
1. Translate "title" into ${interfaceLangName}.
2. Translate "transcript" into ${targetLangName}.
3. In "questions" array, for each question object:
   - Translate "question" into ${interfaceLangName}.
   - Translate all options in the "options" array into ${interfaceLangName}.
   - Translate "answer" into ${interfaceLangName} (matching the correct option).
4. Do NOT change the JSON structure or keys.
5. Output strictly valid JSON.

JSON:
${JSON.stringify(content, null, 2)}`;
  } else if (type === 'speech-prep') {
    prompt = `You are a professional language teacher. Translate and adapt this JSON object of speech preparation tasks.
Target Learning Language (the language the user is learning to speak): ${targetLangName}
User's Interface/Instruction Language (the language of the instructions and tips): ${interfaceLangName}

Ensure that:
1. Translate "topic" into ${interfaceLangName}.
2. Translate all items in the "tips" array into ${interfaceLangName}.
3. Do NOT change the JSON structure or keys.
4. Output strictly valid JSON.

JSON:
${JSON.stringify(content, null, 2)}`;
  } else if (type === 'article-translation') {
    prompt = `You are a professional language teacher. Translate and adapt this JSON object of article translation tasks.
Target Learning Language (the language of the article to be translated): ${targetLangName}
User's Interface/Instruction Language: ${interfaceLangName}

Ensure that:
1. Translate "title" into ${targetLangName}.
2. Translate "text" into ${targetLangName}.
3. Do NOT change the JSON structure or keys.
4. Output strictly valid JSON.

JSON:
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
      model: 'gemini-3.5-flash',
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
    await cacheService.set(cacheKey, JSON.stringify(parsed), 30 * 24 * 3600);
    saveCache();
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
    prompt = `Generate a JSON object containing a list of 10 common public/road signs in ${targetLangName} for a sign reading game.
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
    prompt = `Generate a JSON object containing a list of 10 sentence correction puzzles in ${targetLangName} for a grammar game.
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
      model: 'gemini-3.5-flash',
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
    await cacheService.set(cacheKey, JSON.stringify(parsed), 30 * 24 * 3600);
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
