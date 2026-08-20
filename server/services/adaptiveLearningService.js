const db = require('../db');
const { calculateSM2 } = require('./reviewScheduler');

/**
 * Records a learning attempt and updates skill analytics and weak areas
 */
async function recordAttempt(userId, skill, isCorrect, topic = 'general') {
  try {
    const isCorrVal = isCorrect ? 1 : 0;
    
    // 1. Update Skill Analytics
    const selectQuery = 'SELECT total_attempts, correct_attempts FROM Skill_Analytics WHERE user_id = ? AND skill = ?';
    const [rows] = await db.query(selectQuery, [userId, skill]);
    
    if (rows.length > 0) {
      const total = rows[0].total_attempts + 1;
      const correct = rows[0].correct_attempts + isCorrVal;
      const score = Math.round((correct / total) * 100);
      
      const updateQuery = 'UPDATE Skill_Analytics SET total_attempts = ?, correct_attempts = ?, score = ? WHERE user_id = ? AND skill = ?';
      await db.query(updateQuery, [total, correct, score, userId, skill]);
    } else {
      const score = isCorrVal ? 100 : 0;
      const insertQuery = 'INSERT INTO Skill_Analytics (user_id, skill, total_attempts, correct_attempts, score) VALUES (?, ?, 1, ?, ?)';
      await db.query(insertQuery, [userId, skill, isCorrVal, score]);
    }

    // 2. Log Weak Area if incorrect
    if (!isCorrect) {
      const selectWeak = 'SELECT fail_count FROM Weak_Areas WHERE user_id = ? AND skill = ? AND topic = ?';
      const [weakRows] = await db.query(selectWeak, [userId, skill, topic]);
      
      if (weakRows.length > 0) {
        const count = weakRows[0].fail_count + 1;
        await db.query('UPDATE Weak_Areas SET fail_count = ? WHERE user_id = ? AND skill = ? AND topic = ?', [count, userId, skill, topic]);
      } else {
        await db.query('INSERT INTO Weak_Areas (user_id, skill, topic, fail_count) VALUES (?, ?, ?, 1)', [userId, skill, topic]);
      }
    }
  } catch (err) {
    console.error('Error in recordAttempt service:', err.message);
  }
}

/**
 * Upserts a spaced repetition schedule for a user in the review queue
 */
async function scheduleReview(userId, itemType, itemId, rating) {
  try {
    const selectQuery = 'SELECT repetitions, interval_days, ease_factor FROM Review_Queue WHERE user_id = ? AND item_type = ? AND item_id = ?';
    const [rows] = await db.query(selectQuery, [userId, itemType, itemId]);

    let prevRepetitions = 0;
    let prevInterval = 0;
    let prevEaseFactor = 2.5;

    if (rows.length > 0) {
      prevRepetitions = rows[0].repetitions;
      prevInterval = rows[0].interval_days;
      prevEaseFactor = rows[0].ease_factor;
    }

    const { repetitions, intervalDays, easeFactor, nextReviewDate } = calculateSM2(
      rating,
      prevRepetitions,
      prevInterval,
      prevEaseFactor
    );

    const upsertQuery = `
      INSERT INTO Review_Queue 
      (user_id, item_type, item_id, next_review, repetitions, interval_days, ease_factor, last_reviewed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        next_review = VALUES(next_review),
        repetitions = VALUES(repetitions),
        interval_days = VALUES(interval_days),
        ease_factor = VALUES(ease_factor),
        last_reviewed_at = VALUES(last_reviewed_at)
    `;

    await db.query(upsertQuery, [
      userId, 
      itemType, 
      itemId, 
      nextReviewDate.toISOString().split('T')[0], 
      repetitions, 
      intervalDays, 
      easeFactor
    ]);
  } catch (err) {
    console.error('Error scheduling review in adaptive service:', err.message);
  }
}

/**
 * Compiles a list of adaptive recommendations based on weak skills, failed areas, and review queues
 */
async function getAdaptiveRecommendations(userId) {
  try {
    // 1. Fetch weak skills (score < 60)
    const [weakSkills] = await db.query('SELECT skill, score FROM Skill_Analytics WHERE user_id = ? AND score < 60', [userId]);
    
    // 2. Fetch failed topics (fail_count >= 2)
    const [weakTopics] = await db.query('SELECT skill, topic, fail_count FROM Weak_Areas WHERE user_id = ? AND fail_count >= 2', [userId]);

    // 3. Fetch outstanding review items
    const [reviewItems] = await db.query('SELECT item_type, item_id FROM Review_Queue WHERE user_id = ? AND next_review <= CURRENT_DATE()', [userId]);

    return {
      weakSkills,
      weakTopics,
      reviewItems
    };
  } catch (err) {
    console.error('Error fetching adaptive recommendations:', err.message);
    return { weakSkills: [], weakTopics: [], reviewItems: [] };
  }
}

module.exports = {
  recordAttempt,
  scheduleReview,
  getAdaptiveRecommendations
};
