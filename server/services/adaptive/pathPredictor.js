const db = require('../../db');
const { analyzeUserSkills } = require('./skillAnalyzer');

/**
 * Predicts and maps a dynamic, non-linear lesson progression path for the user
 */
async function generateDynamicPath(userId, skillVectors) {
  const defaultPath = [];
  try {
    // 1. Fetch user progress lessons
    const [progressRows] = await db.query(
      `SELECT p.lesson_id, l.title, l.level, p.status 
       FROM Progress p
       JOIN Lessons l ON p.lesson_id = l.lesson_id
       WHERE p.user_id = ?
       ORDER BY p.progress_id ASC`,
      [userId]
    );

    if (progressRows.length === 0) {
      return [];
    }

    // 2. Fetch skill vectors to determine if booster needs interjection
    const skills = skillVectors || await analyzeUserSkills(userId);

    for (const row of progressRows) {
      defaultPath.push({
        lessonId: row.lesson_id,
        title: row.title,
        level: row.level,
        status: row.status,
        type: 'standard'
      });

      // If the lesson is In Progress or Completed, check if we need to insert a booster immediately after it
      if (row.status === 'In Progress' || row.status === 'completed') {
        if (skills.vocabulary < 70) {
          defaultPath.push({
            lessonId: `booster_vocab_${row.lesson_id}`,
            title: 'Vocabulary Booster Drill',
            level: row.level,
            status: 'Recommended',
            type: 'booster_vocab'
          });
        }
        if (skills.speaking < 70) {
          defaultPath.push({
            lessonId: `booster_speaking_${row.lesson_id}`,
            title: 'Speaking Fluency Booster',
            level: row.level,
            status: 'Recommended',
            type: 'booster_speaking'
          });
        }
      }
    }
  } catch (err) {
    console.error('[Path Predictor Error]:', err.message);
  }

  return defaultPath;
}

module.exports = {
  generateDynamicPath
};
