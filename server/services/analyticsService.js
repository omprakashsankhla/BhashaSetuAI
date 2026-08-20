const db = require('../db');

/**
 * Synchronizes user stats from the live Users table into the User_Analytics table
 * to ensure that engagement dropout risk assessments have access to fresh data.
 * @param {number} userId - The unique ID of the user to sync
 */
async function syncUserAnalytics(userId) {
  if (!userId) return;
  try {
    // 1. Fetch current user gamification stats
    const [rows] = await db.query(
      'SELECT xp, coins, streak, last_login FROM Users WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) return;

    const { xp, coins, streak, last_login } = rows[0];

    // 2. Upsert into User_Analytics
    await db.query(`
      INSERT INTO User_Analytics (user_id, total_xp, total_coins, current_streak, max_streak, last_active)
      VALUES (?, ?, ?, ?, ?, COALESCE(?, CURDATE()))
      ON DUPLICATE KEY UPDATE
        total_xp = VALUES(total_xp),
        total_coins = VALUES(total_coins),
        current_streak = VALUES(current_streak),
        max_streak = GREATEST(max_streak, VALUES(current_streak)),
        last_active = COALESCE(VALUES(last_active), last_active, CURDATE())
    `, [userId, xp, coins, streak, streak, last_login]);
  } catch (err) {
    console.error(`[Analytics Service Sync Error] for user ${userId}:`, err.message);
  }
}

module.exports = { syncUserAnalytics };
