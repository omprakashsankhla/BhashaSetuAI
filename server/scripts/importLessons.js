const db = require('../db');
const fs = require('fs');
const path = require('path');

const lang = process.argv[2];
if (!lang) {
  console.error('Usage: node scripts/importLessons.js <language_code>');
  console.error('Example: node scripts/importLessons.js hi');
  process.exit(1);
}

async function run() {
  console.log(`Starting import for language: ${lang}`);

  // 1. Get lesson IDs from DB mapping by English title
  const [dbLessons] = await db.query('SELECT lesson_id, title FROM Lessons');
  const lessonIdMap = {};
  for (const l of dbLessons) {
    lessonIdMap[l.title] = l.lesson_id;
  }

  const files = [
    `lessons_${lang}.json`,
    `lessons_intermediate_${lang}.json`,
    `lessons_advanced_${lang}.json`
  ];

  let importedCount = 0;

  for (const file of files) {
    const filePath = path.join(__dirname, '..', 'data', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found, skipping: ${file}`);
      continue;
    }

    console.log(`Processing file: ${file}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const lesson of data) {
      const lessonId = lessonIdMap[lesson.title];
      if (!lessonId) {
        console.warn(`No lesson ID found in DB matching title: "${lesson.title}"`);
        continue;
      }

      // Clean up previous entries
      await db.query(
        'DELETE FROM lesson_translations WHERE lesson_id = ? AND language_code = ?',
        [lessonId, lang]
      );

      await db.query(
        'INSERT INTO lesson_translations (lesson_id, language_code, translated_content) VALUES (?, ?, ?)',
        [lessonId, lang, JSON.stringify(lesson)]
      );
      importedCount++;
    }
  }

  console.log(`Import complete! Successfully imported ${importedCount} lessons into the database.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
