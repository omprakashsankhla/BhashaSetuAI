require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), override: true });
const db = require('../db');
const fs = require('fs');
const path = require('path');

const SUPPORTED_LANGUAGES = ['bn', 'mr', 'ta', 'te', 'ur']; // Excluding 'mwr' (Marwadi) as it is not natively supported by Google Translate free endpoint
const BATCH_SIZE = 40;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function translateBatch(strings, targetLang) {
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

// Recursively find all translatable strings in a JSON object
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

// Recursively apply translations back to the JSON object
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
  console.log('Starting FREE Google Translate Lesson Pre-generation...');

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
        await delay(300); // 300ms delay to respect Google free endpoint
      }
      
      // Deep clone the lesson to apply translations
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
