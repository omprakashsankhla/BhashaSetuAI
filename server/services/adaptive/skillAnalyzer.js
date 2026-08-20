const db = require('../../db');

/**
 * Analyzes the student's proficiency level across the 6 core literacy vectors
 */
async function analyzeUserSkills(userId) {
  const skillVectors = {
    reading: 100,
    writing: 100,
    speaking: 100,
    listening: 100,
    vocabulary: 100,
    grammar: 100
  };

  try {
    // 1. Fetch normalized user skills scores
    const [rows] = await db.query(
      'SELECT skill_type, correct_count, total_count FROM User_Skills WHERE user_id = ?',
      [userId]
    );

    for (const row of rows) {
      if (row.total_count > 0) {
        const score = Math.round((row.correct_count / row.total_count) * 100);
        skillVectors[row.skill_type] = score;
      }
    }

    // 2. Adjust for registered weak areas fail count
    const [weakRows] = await db.query(
      'SELECT skill, fail_count FROM Weak_Areas WHERE user_id = ?',
      [userId]
    );

    for (const weak of weakRows) {
      const penalty = Math.min(weak.fail_count * 10, 40); // cap penalty at 40%
      if (skillVectors[weak.skill]) {
        skillVectors[weak.skill] = Math.max(skillVectors[weak.skill] - penalty, 10);
      }
    }
  } catch (err) {
    console.error('[Skill Analyzer Error]:', err.message);
  }

  return skillVectors;
}

module.exports = {
  analyzeUserSkills
};
