require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), override: true });
const db = require('../db');
const fs = require('fs');
const path = require('path');
const lessonService = require('../services/lessonService');

const SUPPORTED_LANGUAGES = ['hi', 'bn', 'mr', 'mwr', 'ta', 'te', 'ur'];

async function run() {
  console.log('Starting Lesson Pre-generation...');

  const files = ['lessons_en.json', 'lessons_intermediate_en.json', 'lessons_advanced_en.json'];
  const lessonsToTranslate = [];

  for (const file of files) {
    const filePath = path.join(__dirname, '..', 'data', file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      for (const lesson of data) {
        lessonsToTranslate.push(lesson.title);
      }
    }
  }

  // Get lesson IDs from DB
  const [dbLessons] = await db.query('SELECT lesson_id, title FROM Lessons');
  
  const lessonIdMap = {};
  for (const l of dbLessons) {
    lessonIdMap[l.title] = l.lesson_id;
  }

  console.log(`Found ${Object.keys(lessonIdMap).length} lessons to pre-generate across ${SUPPORTED_LANGUAGES.length} languages.`);

  for (const lang of SUPPORTED_LANGUAGES) {
    console.log(`\n--- Generating for Language: ${lang} ---`);
    for (const title of Object.keys(lessonIdMap)) {
      const id = lessonIdMap[title];
      try {
        const [rows] = await db.query('SELECT 1 FROM lesson_translations WHERE lesson_id = ? AND language_code = ?', [id, lang]);
        if (rows.length > 0) {
           console.log(`Lesson ${id} ${lang} already cached. Skipping...`);
           continue;
        }
        
        console.log(`Translating Lesson ${id} (${title}) -> ${lang}`);
        await lessonService.getTranslatedLesson(id, lang, true /* isOffline */);
        console.log(`Generated Lesson ${id} ${lang}`);
        
        // 15-second delay ONLY for actual API calls to respect OpenAI free limits
        await new Promise(r => setTimeout(r, 15000));
      } catch (err) {
        console.error(`Failed to generate Lesson ${id} for ${lang}:`, err.message);
      }
    }
  }

  console.log('\nPre-generation Complete!');
  process.exit(0);
}

run();
