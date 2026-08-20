const db = require('../db');
const fs = require('fs');
const path = require('path');

async function run() {
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
  const dbTitles = new Set(dbLessons.map(l => l.title));
  
  console.log(`JSON master files contain ${masterLessons.length} lessons.`);
  console.log(`Database Lessons table contains ${dbLessons.length} lessons.`);
  
  console.log('\nLessons in JSON files but missing in DB:');
  let missingInDbCount = 0;
  masterLessons.forEach(l => {
    if (!dbTitles.has(l.title)) {
      console.log(`  - "${l.title}"`);
      missingInDbCount++;
    }
  });
  
  console.log('\nLessons in DB but missing in JSON files:');
  const jsonTitles = new Set(masterLessons.map(l => l.title));
  let missingInJsonCount = 0;
  dbLessons.forEach(l => {
    if (!jsonTitles.has(l.title)) {
      console.log(`  - "${l.title}" (ID: ${l.lesson_id})`);
      missingInJsonCount++;
    }
  });
  
  process.exit(0);
}

run();
