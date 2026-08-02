const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const { translateOrAdaptContent } = require('./translationHelper');

const router = express.Router();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized!' });
    req.userId = decoded.user_id;
    next();
  });
};

// Generate a random practice session
router.get('/practice', verifyToken, async (req, res) => {
  try {
    const targetLang = req.query.lang || 'hi';
    const interfaceLang = req.query.interfaceLang || 'en';
    
    // Fetch user level to customize the practice content
    const [userRows] = await db.query('SELECT proficiency_level FROM Users WHERE user_id = ?', [req.userId]);
    const userLevel = userRows[0]?.proficiency_level || 'Beginner';
    
    let levelPrefix = '';
    if (userLevel === 'Intermediate') levelPrefix = '_intermediate';
    if (userLevel === 'Advanced') levelPrefix = '_advanced';

    const lesson = { id: 'practice', title: 'Practice Mode', level: userLevel };

    // Always load from the master English lessons file
    let lessonsFilePath = path.join(__dirname, '..', 'data', `lessons${levelPrefix}_en.json`);
    
    let activities = [];
    
    if (fs.existsSync(lessonsFilePath)) {
      const allLessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));
      // Collect all activities from all lessons
      let allActivities = [];
      allLessonsData.forEach(l => {
        if (l.activities) allActivities = allActivities.concat(l.activities);
      });
      
      // Shuffle and pick 40
      allActivities = allActivities.sort(() => 0.5 - Math.random());
      activities = allActivities.slice(0, 40);
    }

    if (activities.length === 0) {
      activities = [
        { id: 1, type: 'MCQ', text: `Identify the correct word in ${targetLang}`, options: ['A', 'B', 'C', 'D'], answer: 'A', feedback: 'Correct!' },
        { id: 2, type: 'Reading', text: `Read this out loud.`, word: `Practice makes perfect.` }
      ];
    }

    const translatedActivities = await translateOrAdaptContent(activities, targetLang, interfaceLang, 'lessons');

    res.status(200).json({ lesson, activities: translatedActivities });
  } catch (error) {
    console.error('Error in Practice Route:', error);
    res.status(500).json({ message: 'Error generating practice session' });
  }
});

router.get('/:lessonId', verifyToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const targetLang = req.query.lang || 'hi';
    const interfaceLang = req.query.interfaceLang || 'en';

    // 1. Fetch the lesson details from the database
    const [lessonRows] = await db.query('SELECT * FROM Lessons WHERE lesson_id = ?', [lessonId]);
    if (lessonRows.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    const lesson = lessonRows[0];
    
    // Parse content_data to get the type
    let lessonType = 'quiz';
    try {
      const contentData = JSON.parse(lesson.content_data);
      if (contentData && contentData.type) lessonType = contentData.type;
    } catch (e) {}

    // Determine which file prefix to use based on level
    let levelPrefix = '';
    if (lesson.level === 'Intermediate') levelPrefix = '_intermediate';
    if (lesson.level === 'Advanced') levelPrefix = '_advanced';

    // Always load from the master English lessons file
    let lessonsFilePath = path.join(__dirname, '..', 'data', `lessons${levelPrefix}_en.json`);
    let activities = [];

    if (fs.existsSync(lessonsFilePath)) {
      const allLessonsData = JSON.parse(fs.readFileSync(lessonsFilePath, 'utf8'));
      const lessonData = allLessonsData.find(l => l.title === lesson.title);
      
      if (lessonData && lessonData.activities && lessonData.activities.length > 0) {
        activities = lessonData.activities;
      }
    }

    if (activities.length === 0) {
      activities = [
        { id: 1, type: 'MCQ', text: `Question data missing for ${lesson.title}. Please provide JSON.`, options: ['A', 'B', 'C', 'D'], answer: 'A', feedback: 'Missing JSON data.' }
      ];
    }

    const translatedActivities = await translateOrAdaptContent(activities, targetLang, interfaceLang, 'lessons');

    // Translate lesson metadata (title)
    try {
      const [translatedLessonMeta] = await translateOrAdaptContent([{ title: lesson.title }], targetLang, interfaceLang, 'lesson_meta');
      if (translatedLessonMeta) {
        lesson.title = translatedLessonMeta.title;
      }
    } catch (e) {
      console.error('Failed to translate lesson title in learning.js:', e);
    }

    res.status(200).json({ lesson, activities: translatedActivities });

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
      `SELECT progress_id FROM Progress WHERE user_id = ? AND status = 'Not Started' ORDER BY progress_id ASC LIMIT 1`,
      [req.userId]
    );

    if (progressRows.length > 0) {
      const nextProgressId = progressRows[0].progress_id;
      await db.query(
        `UPDATE Progress SET status = 'In Progress' WHERE progress_id = ?`,
        [nextProgressId]
      );
    }
    
    // 3. Add 10 coins and 20 XP to the user's stats
    await db.query(
      `UPDATE Users SET coins = coins + 10, xp = xp + 20 WHERE user_id = ?`,
      [req.userId]
    );

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

    res.status(200).json({ message: 'Skill progress updated', skillsProgress });
  } catch (error) {
    console.error('Error updating skill progress:', error);
    res.status(500).json({ message: 'Server error updating skill progress' });
  }
});

module.exports = router;
