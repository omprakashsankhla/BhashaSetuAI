const db = require('../db');

async function run() {
  try {
    console.log('Fixing Lessons table title mismatches...');
    
    const [res1] = await db.query("UPDATE Lessons SET title = 'Weekly Assessment 1' WHERE title = 'Weekly Assessment'");
    console.log(`Updated 'Weekly Assessment' to 'Weekly Assessment 1'. Affected rows: ${res1.affectedRows}`);
    
    const [res2] = await db.query("UPDATE Lessons SET title = 'Weekly Test 2' WHERE title = 'Weekly Test'");
    console.log(`Updated 'Weekly Test' to 'Weekly Test 2'. Affected rows: ${res2.affectedRows}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Failed to update DB titles:', err.message);
    process.exit(1);
  }
}

run();
