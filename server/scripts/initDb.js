require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function initDatabase() {
  logger.info('Connecting to database to initialize schema...');
  
  let pool;
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      multipleStatements: true // Required to run the full schema.sql at once
    });
  } catch (err) {
    logger.error('Failed to create database connection pool: ' + err.message);
    process.exit(1);
  }

  try {
    // 1. Read the schema.sql file
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // 2. Execute the schema.sql
    logger.info('Executing schema.sql...');
    await pool.query(schemaSql);
    logger.info('✅ Successfully created all tables including PushSubscriptions!');

    // 3. Read and execute seed.sql if it exists
    const seedPath = path.join(__dirname, '../db/seed.sql');
    if (fs.existsSync(seedPath)) {
      logger.info('Executing seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await pool.query(seedSql);
      logger.info('✅ Successfully inserted seed data!');
    }

  } catch (error) {
    logger.error('❌ Failed to initialize database: ' + error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
    process.exit(0);
  }
}

initDatabase();
