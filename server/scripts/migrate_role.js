const db = require('../db');

async function run() {
  try {
    console.log('Running role enum migration...');
    await db.query(`
      ALTER TABLE Users 
      MODIFY COLUMN role ENUM('Student', 'Educator', 'Admin') DEFAULT 'Student'
    `);
    console.log('Successfully updated role enum to support Educator!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

run();
