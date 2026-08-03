require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('./utils/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
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
    'Platform_Settings', 'Assignments', 'PushSubscriptions'
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
      logger.info('Auto-creating missing tables: ' + missingTables.join(', '));
      const fs = require('fs');
      const path = require('path');
      const schemaPath = path.join(__dirname, 'db', 'schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        // Split SQL script by semicolons to execute line by line
        const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
        
        for (const statement of statements) {
          await pool.query(statement);
        }
        logger.info('Successfully auto-created all missing tables from schema.sql');
      } else {
        throw new Error('schema.sql not found! Cannot auto-create tables.');
      }
    }
    
    logger.info('Database verification complete: All required tables exist.');
  } catch (err) {
    logger.error('Failed to connect to database or verify tables: ' + err.message);
    throw err;
  }
}

pool.verifyDatabase = verifyDatabase;
module.exports = pool;
