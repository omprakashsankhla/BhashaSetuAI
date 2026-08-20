const db = require('../db');
const logger = require('../utils/logger');

/**
 * Audit database tables and create critical indexes if they do not exist
 */
async function auditAndCreateIndexes() {
  logger.info('--- STARTING DATABASE INDEX AUDIT ---');

  const indexMappings = [
    { table: 'Users', index: 'idx_users_email', columns: ['email'] },
    { table: 'Progress', index: 'idx_progress_seq', columns: ['user_id', 'lesson_id', 'status'] },
    { table: 'lesson_translations', index: 'lesson_lang_unique', columns: ['lesson_id', 'language_code', 'interface_language'] },
    { table: 'User_Skills', index: 'idx_user_skills_vec', columns: ['user_id', 'skill_type'] },
    { table: 'Weak_Areas', index: 'idx_weak_areas_uid', columns: ['user_id'] },
    { table: 'Review_Queue', index: 'idx_review_queue_uid', columns: ['user_id'] },
    { table: 'Audit_Logs', index: 'idx_audit_logs_action', columns: ['user_id', 'action'] }
  ];

  for (const mapping of indexMappings) {
    try {
      // 1. Check if index already exists
      const [showIndexes] = await db.query(`SHOW INDEX FROM ${mapping.table}`);
      const indexNames = showIndexes.map((row) => row.Key_name);

      if (indexNames.includes(mapping.index)) {
        logger.info(`Index "${mapping.index}" already exists on table "${mapping.table}".`);
      } else {
        // 2. Create the index
        logger.warn(`Index "${mapping.index}" is missing on table "${mapping.table}". Creating...`);
        const colList = mapping.columns.join(', ');
        await db.query(`CREATE INDEX ${mapping.index} ON ${mapping.table} (${colList})`);
        logger.info(`Index "${mapping.index}" created successfully on table "${mapping.table}".`);
      }
    } catch (err) {
      logger.error(`Failed to audit/create index "${mapping.index}" on table "${mapping.table}": ${err.message}`);
    }
  }

  logger.info('--- DATABASE INDEX AUDIT COMPLETED ---');
}

// Run if called directly
if (require.main === module) {
  auditAndCreateIndexes()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = {
  auditAndCreateIndexes
};
