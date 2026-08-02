require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

async function verifyDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bhashasetu_db',
  };

  const requiredTables = [
    'Users',
    'Assessments',
    'Lessons',
    'Progress',
    'Voice_Assessments',
    'Recommendations',
    'Announcements',
    'Platform_Settings',
    'Assignments'
  ];

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Successfully connected to database.');

    const [rows] = await connection.execute('SHOW TABLES');
    const existingTables = rows.map(row => Object.values(row)[0]);

    let missingTables = [];
    for (const table of requiredTables) {
      if (!existingTables.includes(table)) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      console.error('❌ CRITICAL ERROR: Database is missing required tables:');
      missingTables.forEach(t => console.error(`   - ${t}`));
      console.error('\n⚠️  Please run: mysql -u root -p < server/db/schema.sql');
      process.exit(1);
    } else {
      console.log('✅ All required tables verified.');
    }

    // Verify some critical indexes exist
    const [indexes] = await connection.execute(`
      SELECT TABLE_NAME, INDEX_NAME 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND INDEX_NAME != 'PRIMARY'
    `, [dbConfig.database]);
    
    if (indexes.length === 0) {
       console.warn('⚠️ WARNING: No secondary indexes found. Did you run the latest schema.sql?');
    } else {
       console.log(`✅ Verified ${indexes.length} database indexes.`);
    }

    console.log('🟢 Database verification complete.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Failed to connect to or verify database:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

verifyDatabase();
