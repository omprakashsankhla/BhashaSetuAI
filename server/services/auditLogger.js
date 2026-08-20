const db = require('../db');
const logger = require('../utils/logger');

/**
 * Log progress, security, or administration events into Audit_Logs database table
 */
async function logAuditEvent(userId, action, details = null, ipAddress = null) {
  try {
    const detailsStr = details ? (typeof details === 'object' ? JSON.stringify(details) : String(details)) : null;
    await db.query(
      'INSERT INTO Audit_Logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [userId, action, detailsStr, ipAddress]
    );
    logger.info(`[Audit Log] Saved action "${action}" for user: ${userId}`);
  } catch (err) {
    logger.error(`[Audit Log Fail] Failed to save audit log: ${err.message}`);
  }
}

module.exports = {
  logAuditEvent
};
