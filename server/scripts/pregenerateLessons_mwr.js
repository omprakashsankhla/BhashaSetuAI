require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), override: true });
const db = require('../db');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const SUPPORTED_LANGUAGES = ['mwr'];
const BATCH_SIZE = 25; // Smaller batch for Gemini JSON context limit

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function translateBatch(strings, targetLang) {
  if (strings.length === 0) return [];
  
  let attempts = 0;
  while (attempts < 3) {
    try {
      const prompt = `Translate the following JSON array of strings to Marwadi (mwr). Return ONLY a valid JSON array of the translated strings in the EXACT same order. Do NOT include any markdown formatting, backticks, or other text. Here is the array: ${JSON.stringify(strings)}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
      });

      let text = response.text.trim();
      if (text.startsWith('```json')) text = text.substring(7);
      if (text.startsWith('```')) text = text.substring(3);
      if (text.endsWith('```')) text = text.substring(0, text.length - 3);
      
      const translatedList = JSON.parse(text.trim());
      
      if (Array.isArray(translatedList) && translatedList.length === strings.length) {
        return translatedList;
      } else {
        throw new Error('Length mismatch or invalid array');
      }
    } catch (err) {
      attempts++;
      console.log(`[Error] Batch translation failed (attempt ${attempts}):`, err.message);
      await delay(5000); // 5s backoff
    }
  }
  
  console.log(`[Error] Returning original strings after 3 failed attempts.`);
  return strings; // Fallback
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

function applyTranslations(obj, translationMap) {
  if (Array.isArray(obj)) {
    obj.forEach(item => applyTranslations(item, translationMap));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
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
        applyTranslations(obj[key], translationMap);
      }
    }
  }
}

async function run() {
  console.log('Starting Gemini Marwadi Lesson Pre-generation...');

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

  for (const lang of SUPPORTED_LANGUAGES) {
    console.log(`\n--- Generating for Language: ${lang} ---`);
    for (const lesson of masterLessons) {
      const id = lessonIdMap[lesson.title];
      if (!id) continue;

      const [rows] = await db.query('SELECT 1 FROM lesson_translations WHERE lesson_id = ? AND language_code = ?', [id, lang]);
      if (rows.length > 0) {
         continue; // Skip already translated
      }
      
      const stringsToTranslate = [];
      extractStrings(lesson.activities, stringsToTranslate);
      
      const uniqueStrings = Array.from(new Set(stringsToTranslate));
      const translationMap = {};
      
      for (let i = 0; i < uniqueStrings.length; i += BATCH_SIZE) {
        const batch = uniqueStrings.slice(i, i + BATCH_SIZE);
        const results = await translateBatch(batch, lang);
        for (let j = 0; j < batch.length; j++) {
          translationMap[batch[j]] = results[j];
        }
        await delay(4500); // 4.5s delay to stay securely under the 15 requests per minute free tier limit
      }
      
      const translatedActivities = JSON.parse(JSON.stringify(lesson.activities));
      applyTranslations(translatedActivities, translationMap);
      
      const translatedLesson = {
        ...lesson,
        activities: translatedActivities
      };

      await db.query(
        'REPLACE INTO lesson_translations (lesson_id, language_code, interface_language, translated_content) VALUES (?, ?, ?, ?)',
        [id, lang, 'en', JSON.stringify(translatedLesson)]
      );

      console.log(`Generated Lesson ${id} ${lang}`);
    }
  }

  console.log('\nPre-generation Complete!');
  process.exit(0);
}

run();
