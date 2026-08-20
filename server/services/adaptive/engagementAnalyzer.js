const db = require('../../db');

/**
 * Predicts engagement dropout risk based on login history and streaks
 */
async function analyzeUserEngagement(userId) {
  let dropoutRisk = 'Low';
  let motivationMessage = 'Keep up the fantastic work!';

  try {
    const [rows] = await db.query(
      'SELECT current_streak, last_active FROM User_Analytics WHERE user_id = ?',
      [userId]
    );

    if (rows.length > 0) {
      const { current_streak, last_active } = rows[0];
      const lastActiveDate = last_active ? new Date(last_active) : null;
      const today = new Date();

      if (lastActiveDate) {
        const diffTime = Math.abs(today - lastActiveDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 7) {
          dropoutRisk = 'High';
          motivationMessage = 'We miss you! Come back to continue your multilingual learning adventure!';
        } else if (diffDays >= 3 || current_streak === 0) {
          dropoutRisk = 'Medium';
          motivationMessage = 'Streak saver active! Complete 1 quick game today to build your learning habits.';
        }
      }
    }
  } catch (err) {
    console.error('[Engagement Analyzer Error]:', err.message);
  }

  return {
    dropoutRisk,
    motivationMessage
  };
}

module.exports = {
  analyzeUserEngagement
};
