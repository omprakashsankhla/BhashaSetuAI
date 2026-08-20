require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), override: true });
const db = require('../db');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function translateBatchGoogle(strings, targetLang) {
  if (strings.length === 0) return [];
  const textToTranslate = strings.map((str, idx) => `${idx + 1} ||| ${str}`).join('\n');
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(textToTranslate)}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (!data || !data[0]) throw new Error('Invalid format');
    
    const fullText = data[0].map(part => part[0]).join('');
    const translatedList = new Array(strings.length);
    for (const match of fullText.matchAll(/^(\d+)\s*\|\|\|\s*(.*)$/gm)) {
      const idx = parseInt(match[1], 10) - 1;
      if (idx >= 0 && idx < strings.length) {
        translatedList[idx] = match[2].trim();
      }
    }
    for (let i = 0; i < strings.length; i++) {
      if (translatedList[i] === undefined || translatedList[i] === null) {
        translatedList[i] = strings[i];
      }
    }
    return translatedList;
  } catch (err) {
    console.error(`[Error] Batch translation failed for ${targetLang}:`, err.message);
    return strings;
  }
}

async function translateBatchGemini(strings) {
  if (strings.length === 0) return [];
  let attempts = 0;
  while (attempts < 3) {
    try {
      const prompt = `Translate the following JSON array of strings to Marwadi (mwr). Return ONLY a valid JSON array of the translated strings in the EXACT same order. Do NOT include any markdown formatting, backticks, or other text. Here is the array: ${JSON.stringify(strings)}`;
      const apiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
      });

      let text = response.text.trim();
      if (text.startsWith('\`\`\`json')) text = text.substring(7);
      if (text.startsWith('\`\`\`')) text = text.substring(3);
      if (text.endsWith('\`\`\`')) text = text.substring(0, text.length - 3);
      
      const translatedList = JSON.parse(text.trim());
      if (Array.isArray(translatedList) && translatedList.length === strings.length) {
        return translatedList;
      }
      throw new Error('Length mismatch');
    } catch (err) {
      attempts++;
      await delay(5000);
    }
  }
  return strings; 
}

function extractStrings(obj, stringsList) {
  if (Array.isArray(obj)) {
    obj.forEach(item => extractStrings(item, stringsList));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (['word', 'translation', 'sentence', 'text', 'question', 'options', 'hint', 'description', 'answer', 'feedback'].includes(key)) {
        if (typeof obj[key] === 'string' && obj[key].trim().length > 0) {
          stringsList.push(obj[key]);
        } else if (Array.isArray(obj[key])) {
          obj[key].forEach(val => {
            if (typeof val === 'string' && val.trim().length > 0) stringsList.push(val);
          });
        }
      } else {
        extractStrings(obj[key], stringsList);
      }
    }
  }
}

function applyTranslations(obj, translationMap, isInterfaceEnglish) {
  if (Array.isArray(obj)) {
    obj.forEach(item => applyTranslations(item, translationMap, isInterfaceEnglish));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      // For EN interface, keep feedback and hints in English, but translate the question/text to the Learn Language
      if (isInterfaceEnglish && ['feedback', 'hint', 'description'].includes(key)) {
        continue; 
      }
      
      if (['word', 'translation', 'sentence', 'text', 'question', 'options', 'hint', 'description', 'answer', 'feedback'].includes(key)) {
        if (typeof obj[key] === 'string' && obj[key].trim().length > 0) {
          obj[key] = translationMap[obj[key]] || obj[key];
        } else if (Array.isArray(obj[key])) {
          for (let i = 0; i < obj[key].length; i++) {
            if (typeof obj[key][i] === 'string' && obj[key][i].trim().length > 0) {
              obj[key][i] = translationMap[obj[key][i]] || obj[key][i];
            }
          }
        }
      } else {
        applyTranslations(obj[key], translationMap, isInterfaceEnglish);
      }
    }
  }
}

async function run() {
  console.log('Rebuilding flawless cache for ALL languages...');

  const files = ['lessons_en.json', 'lessons_intermediate_en.json', 'lessons_advanced_en.json'];
  const masterLessons = [];

  for (const file of files) {
    const filePath = path.join(__dirname, '..', 'data', file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      masterLessons.push(...data);
    }
  }

  const [dbLessons] = await db.query('SELECT lesson_id, title FROM Lessons');
  const lessonIdMap = {};
  for (const l of dbLessons) {
    lessonIdMap[l.title] = l.lesson_id;
  }

  const stringsToTranslate = [];
  masterLessons.forEach(l => extractStrings(l.activities, stringsToTranslate));
  const uniqueStrings = Array.from(new Set(stringsToTranslate));
  console.log(`Extracted ${uniqueStrings.length} unique strings to translate.`);

  const languages = ['hi', 'bn', 'mr', 'ta', 'te', 'ur', 'mwr'];

  for (const lang of languages) {
    console.log(`\n--- Generating Maps for Language: ${lang} ---`);
    const translationMap = {};
    
    if (lang === 'mwr') {
      const batchSize = 25;
      for (let i = 0; i < uniqueStrings.length; i += batchSize) {
        const batch = uniqueStrings.slice(i, i + batchSize);
        console.log(`  MWR Gemini Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uniqueStrings.length / batchSize)}`);
        const results = await translateBatchGemini(batch);
        for (let j = 0; j < batch.length; j++) translationMap[batch[j]] = results[j];
        await delay(4500); 
      }
    } else {
      const batchSize = 40;
      for (let i = 0; i < uniqueStrings.length; i += batchSize) {
        const batch = uniqueStrings.slice(i, i + batchSize);
        const results = await translateBatchGoogle(batch, lang);
        for (let j = 0; j < batch.length; j++) translationMap[batch[j]] = results[j];
        await delay(300);
      }
    }

    // Now generate both 'en' interface and 'lang' interface caches
    for (const lesson of masterLessons) {
      const id = lessonIdMap[lesson.title];
      if (!id) continue;

      // 1. Generate interface_language = 'en'
      const activitiesEnUI = JSON.parse(JSON.stringify(lesson.activities));
      applyTranslations(activitiesEnUI, translationMap, true);
      const lessonEnUI = { ...lesson, activities: activitiesEnUI };
      await db.query(
        'REPLACE INTO lesson_translations (lesson_id, language_code, interface_language, translated_content) VALUES (?, ?, ?, ?)',
        [id, lang, 'en', JSON.stringify(lessonEnUI)]
      );

      // 2. Generate interface_language = lang
      const activitiesLangUI = JSON.parse(JSON.stringify(lesson.activities));
      applyTranslations(activitiesLangUI, translationMap, false);
      const lessonLangUI = { ...lesson, activities: activitiesLangUI };
      await db.query(
        'REPLACE INTO lesson_translations (lesson_id, language_code, interface_language, translated_content) VALUES (?, ?, ?, ?)',
        [id, lang, lang, JSON.stringify(lessonLangUI)]
      );
    }
    console.log(`Successfully mapped and saved BOTH UI versions for ${lang}.`);
  }

  console.log('\nGlobal Rebuild Complete!');
  process.exit(0);
}

run();
