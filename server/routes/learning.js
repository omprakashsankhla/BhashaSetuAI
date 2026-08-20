const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const { translateOrAdaptContent } = require('./translationHelper');
const { recordAttempt } = require('../services/adaptiveLearningService');
const { logAuditEvent } = require('../services/auditLogger');
const { syncUserAnalytics } = require('../services/analyticsService');

const router = express.Router();

const verifyToken = require('../middleware/auth');
const languageContext = require('../middleware/languageContext');
const lessonService = require('../services/lessonService');

// Generate a random practice session
router.get('/practice', verifyToken, languageContext, async (req, res) => {
  try {
    const targetLang = req.learningLanguage;
    const lesson = { id: 'practice', title: 'Practice Mode', level: 'Beginner' };
    
    // Get practice lesson directly from the caching service
    const translatedData = await lessonService.getTranslatedLesson('practice', targetLang, req.interfaceLanguage);

    res.status(200).json({ lesson, activities: translatedData.activities });
  } catch (error) {
    console.error('Error in Practice Route:', error);
    res.status(500).json({ message: 'Error generating practice session' });
  }
});

router.get('/:lessonId', verifyToken, languageContext, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const targetLang = req.learningLanguage;

    // 1. Fetch the lesson details from the database
    const [lessonRows] = await db.query('SELECT * FROM Lessons WHERE lesson_id = ?', [lessonId]);
    if (lessonRows.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    const lesson = lessonRows[0];

    // Find 1-based sequence number of this lesson within its level based on user's progress path
    const [userProgress] = await db.query(
      `SELECT p.lesson_id FROM Progress p
       JOIN Lessons l ON p.lesson_id = l.lesson_id
       WHERE p.user_id = ? AND l.level = ?
       ORDER BY p.progress_id ASC`,
      [req.userId, lesson.level]
    );
    const seqIdx = userProgress.findIndex(l => l.lesson_id === lesson.lesson_id);
    lesson.sequenceNumber = seqIdx !== -1 ? seqIdx + 1 : 1;

    // 2. Fetch cached translation via LessonService
    const translatedData = await lessonService.getTranslatedLesson(lessonId, targetLang, req.interfaceLanguage);
    
    const activities = translatedData ? translatedData.activities : [];

    if (activities.length === 0) {
      activities.push({ id: 1, type: 'MCQ', text: `Question data missing.`, options: ['A', 'B'], answer: 'A', feedback: 'Missing JSON data.' });
    }

    res.status(200).json({ lesson, activities });

  } catch (error) {
    console.error('Error in Learning Route:', error);
    res.status(500).json({ message: 'Error fetching lesson' });
  }
});

// Complete a lesson and unlock the next one
router.post('/:lessonId/complete', verifyToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    // Practice Completion Logic
    if (lessonId === 'practice') {
      await db.query(`UPDATE Users SET xp = xp + 10 WHERE user_id = ?`, [req.userId]);
      await syncUserAnalytics(req.userId);
      return res.status(200).json({ message: 'Practice completed successfully', xpEarned: 10, coinsEarned: 0 });
    }
    
    // 1. Verify that this lesson is unlocked (i.e., it is the first incomplete lesson in sequence)
    const [allUserProgress] = await db.query(`
      SELECT lesson_id, status FROM Progress WHERE user_id = ? ORDER BY progress_id ASC
    `, [req.userId]);

    const activeLesson = allUserProgress.find(p => p.status !== 'completed' && p.status !== 'Completed');
    if (!activeLesson) {
      return res.status(400).json({ message: 'All lessons are already completed.' });
    }

    if (activeLesson.lesson_id !== parseInt(lessonId)) {
      // If it is already completed in the DB, return success gracefully
      const checkSelf = allUserProgress.find(p => p.lesson_id === parseInt(lessonId));
      if (checkSelf && (checkSelf.status === 'completed' || checkSelf.status === 'Completed')) {
        return res.status(200).json({ message: 'Lesson already completed', xpEarned: 0, coinsEarned: 0 });
      }
      return res.status(400).json({ message: 'This lesson is locked. You must complete previous lessons first.' });
    }

    // 2. Mark current lesson as completed
    await db.query(
      `UPDATE Progress SET status = 'completed', completed_at = NOW() WHERE user_id = ? AND lesson_id = ?`,
      [req.userId, lessonId]
    );
    // 2. Find the next sequential lesson for this user that is 'Not Started' and unlock it
    const [progressRows] = await db.query(
      `SELECT p.progress_id, l.level 
       FROM Progress p 
       JOIN Lessons l ON p.lesson_id = l.lesson_id 
       WHERE p.user_id = ? AND p.status = 'Not Started' 
       ORDER BY p.progress_id ASC LIMIT 1`,
      [req.userId]
    );

    if (progressRows.length > 0) {
      const nextProgressId = progressRows[0].progress_id;
      const nextLevel = progressRows[0].level;
      await db.query(
        `UPDATE Progress SET status = 'In Progress' WHERE progress_id = ?`,
        [nextProgressId]
      );
      // Auto-update user's proficiency level when transitioning levels
      await db.query(
        `UPDATE Users SET proficiency_level = ? WHERE user_id = ?`,
        [nextLevel, req.userId]
      );
    }
    
    // 3. Add 10 coins and 20 XP to the user's stats
    await db.query(
      `UPDATE Users SET coins = coins + 10, xp = xp + 20 WHERE user_id = ?`,
      [req.userId]
    );
    await syncUserAnalytics(req.userId);

    await logAuditEvent(req.userId, 'LESSON_COMPLETE', { lessonId }, req.ip);

    res.status(200).json({ message: 'Lesson completed successfully', xpEarned: 20, coinsEarned: 10 });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ message: 'Server error completing lesson' });
  }
});

// Update granular skill progress
router.post('/progress/skill', verifyToken, async (req, res) => {
  try {
    const { skill, isCorrect, source } = req.body;
    if (!skill) return res.status(400).json({ message: 'Skill is required' });

    // Ensure skill is valid
    const validSkills = ['reading', 'writing', 'speaking', 'listening', 'vocabulary', 'grammar'];
    const normalizedSkill = skill.toLowerCase();
    
    // Map some aliases (like MCQ to vocabulary, Reading to reading, etc.)
    let mappedSkill = normalizedSkill;
    if (mappedSkill === 'mcq') mappedSkill = 'vocabulary';
    if (mappedSkill === 'puzzle') mappedSkill = 'grammar';
    if (mappedSkill === 'voice') mappedSkill = 'speaking';
    
    if (!validSkills.includes(mappedSkill)) {
      mappedSkill = 'vocabulary'; // Default
    }

    const [userRows] = await db.query('SELECT skills_progress FROM Users WHERE user_id = ?', [req.userId]);
    if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    let skillsProgress = {};
    if (userRows[0].skills_progress) {
      try {
        skillsProgress = typeof userRows[0].skills_progress === 'string' 
          ? JSON.parse(userRows[0].skills_progress) 
          : userRows[0].skills_progress;
      } catch(e) {}
    }

    // Initialize if needed
    if (!skillsProgress[mappedSkill]) {
      skillsProgress[mappedSkill] = { total: 0, correct: 0 };
    }

    skillsProgress[mappedSkill].total += 1;
    if (isCorrect) {
      skillsProgress[mappedSkill].correct += 1;
    }

    const todayStr = new Date().toLocaleDateString('en-CA');
    if (source === 'game') {
      skillsProgress.last_game_date = todayStr;
    } else {
      skillsProgress.last_activity_date = todayStr;
    }

    await db.query(
      'UPDATE Users SET skills_progress = ? WHERE user_id = ?',
      [JSON.stringify(skillsProgress), req.userId]
    );

    // Persist structured attempts in normalized tables
    await recordAttempt(req.userId, mappedSkill, isCorrect, 'general');

    res.status(200).json({ message: 'Skill progress updated', skillsProgress });
  } catch (error) {
    console.error('Error updating skill progress:', error);
    res.status(500).json({ message: 'Server error updating skill progress' });
  }
});

module.exports = router;
