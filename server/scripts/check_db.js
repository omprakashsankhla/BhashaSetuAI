const db = require('../db');

async function run() {
  try {
    const [lessons] = await db.query('SELECT COUNT(*) as count FROM Lessons');
    const [translations] = await db.query('SELECT language_code, COUNT(*) as count FROM lesson_translations GROUP BY language_code');
    console.log(`Total Lessons in master table: ${lessons[0].count}`);
    console.log('Translations cached in DB:');
    translations.forEach(t => {
      console.log(`  ${t.language_code}: ${t.count}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Failed to query DB:', err.message);
    process.exit(1);
  }
}

run();
