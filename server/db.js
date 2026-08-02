require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('./utils/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function verifyDatabase() {
  const requiredTables = [
    'Users', 'Assessments', 'Lessons', 'Progress', 
    'Voice_Assessments', 'Recommendations', 'Announcements', 
    'Platform_Settings', 'Assignments'
  ];

  try {
    const [rows] = await pool.query('SHOW TABLES');
    const existingTables = rows.map(row => Object.values(row)[0]);

    let missingTables = [];
    for (const table of requiredTables) {
      if (!existingTables.includes(table) && !existingTables.includes(table.toLowerCase())) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      const msg = 'CRITICAL ERROR: Database is missing required tables: ' + missingTables.join(', ') + '. Please run the schema.sql migration script.';
      logger.error(msg);
      throw new Error(msg);
    }
    
    logger.info('Database verification complete: All required tables exist.');
  } catch (err) {
    logger.error('Failed to connect to database or verify tables: ' + err.message);
    throw err;
  }
}

pool.verifyDatabase = verifyDatabase;
module.exports = pool;
