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
      if (missingTables.length === 1 && missingTables[0] === 'PushSubscriptions') {
        logger.info('Auto-creating missing PushSubscriptions table...');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS PushSubscriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            endpoint TEXT NOT NULL,
            p256dh VARCHAR(255) NOT NULL,
            auth VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
            INDEX idx_push_user_id (user_id)
          );
        `);
      } else {
        const msg = 'CRITICAL ERROR: Database is missing required tables: ' + missingTables.join(', ') + '. Please run the schema.sql migration script.';
        logger.error(msg);
        throw new Error(msg);
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
