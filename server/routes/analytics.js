const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config({ override: true });

const router = express.Router();

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized!' });
    
    // Verify role
    const [rows] = await db.query('SELECT role FROM Users WHERE user_id = ?', [decoded.user_id]);
    if (rows.length === 0 || rows[0].role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    
    req.userId = decoded.user_id;
    next();
  });
};

// GET /api/analytics/dashboard
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    // 1. User Metrics
    const [[{ total_users }]] = await db.query('SELECT COUNT(*) as total_users FROM Users');
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    const [[{ mau }]] = await db.query('SELECT COUNT(*) as mau FROM Users WHERE last_login >= ?', [thirtyDaysAgo]);
    const [[{ wau }]] = await db.query('SELECT COUNT(*) as wau FROM Users WHERE last_login >= ?', [sevenDaysAgo]);
    const [[{ dau }]] = await db.query('SELECT COUNT(*) as dau FROM Users WHERE last_login >= ?', [oneDayAgo]);

    // 2. Language Distribution (Learning Language)
    const [langDist] = await db.query('SELECT learning_language, COUNT(*) as count FROM Users GROUP BY learning_language');
    
    // 3. Lesson Completion Stats
    const [lessonStats] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM Progress 
      GROUP BY status
    `);

    // 4. Activity Logs for past 7 days (Mocked via Progress/Assessments if no specific tracking table)
    // We will aggregate completions by date for a chart
    const [activityTrend] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as completions
      FROM Progress
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [sevenDaysAgo]);

    res.json({
      metrics: { total_users, mau, wau, dau },
      languageDistribution: langDist,
      lessonStatus: lessonStats,
      activityTrend
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    res.status(500).json({ message: 'Failed to generate analytics' });
  }
});

// GET /api/analytics/export
router.get('/export', verifyAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id, u.name, u.email, u.role, 
        COALESCE(u.learning_language, 'hi') as learning_language, 
        COALESCE(u.preferred_language, 'en') as preferred_language, 
        COALESCE(u.proficiency_level, 'Beginner') as proficiency_level, 
        u.xp, u.coins,
        (SELECT COUNT(*) FROM Progress p WHERE p.user_id = u.user_id AND p.status = 'Completed') as completed_lessons,
        (SELECT COUNT(*) FROM Assessments a WHERE a.user_id = u.user_id) as assessments_count,
        COALESCE((SELECT AVG(a.score) FROM Assessments a WHERE a.user_id = u.user_id), 0) as average_assessment_score
      FROM Users u
    `;
    const [students] = await db.query(query);

    // Build CSV Content
    let csv = 'User ID,Name,Email,Role,Learning Language,Interface Language,Level,XP,Coins,Lessons Completed,Assessments Attempted,Avg Assessment Score\n';
    
    for (const student of students) {
      csv += `${student.user_id},"${student.name.replace(/"/g, '""')}","${student.email.replace(/"/g, '""')}",${student.role},${student.learning_language},${student.preferred_language},${student.proficiency_level},${student.xp},${student.coins},${student.completed_lessons},${student.assessments_count},${parseFloat(student.average_assessment_score).toFixed(2)}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student_analytics.csv');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('[Analytics Export API] Error:', error);
    res.status(500).json({ message: 'Failed to export student analytics' });
  }
});

module.exports = router;
