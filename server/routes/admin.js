const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized!' });
    if (decoded.role !== 'Admin') return res.status(403).json({ message: 'Forbidden! Admin access only.' });
    req.userId = decoded.user_id;
    next();
  });
};

router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const [userRows] = await db.query("SELECT COUNT(*) as count FROM Users WHERE role = 'Student'");
    const totalStudents = userRows[0].count;

    const [assessmentRows] = await db.query("SELECT AVG(score) as avgScore FROM Assessments");
    const avgScore = assessmentRows[0].avgScore ? parseFloat(assessmentRows[0].avgScore).toFixed(1) : 0;

    const [progressRows] = await db.query("SELECT COUNT(*) as count FROM Progress WHERE status = 'Completed'");
    const lessonsCompleted = progressRows[0].count;

    res.status(200).json({
      totalStudents,
      avgScore,
      lessonsCompleted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
});

router.get('/analytics', verifyAdminToken, async (req, res) => {
  try {
    const [userRows] = await db.query("SELECT COUNT(*) as count FROM Users WHERE role = 'Student'");
    const totalStudents = userRows[0].count;

    const [assessmentRows] = await db.query("SELECT AVG(score) as avgScore FROM Assessments");
    const avgScore = assessmentRows[0].avgScore ? parseFloat(assessmentRows[0].avgScore).toFixed(1) : 0;

    const [progressRows] = await db.query("SELECT COUNT(*) as count FROM Progress WHERE status = 'Completed'");
    const lessonsCompleted = progressRows[0].count;

    // Language Distribution
    const [langRows] = await db.query("SELECT preferred_language as language, COUNT(*) as count FROM Users WHERE role = 'Student' GROUP BY preferred_language");
    
    // Skill averages
    const [skillRows] = await db.query("SELECT type as skill, AVG(score) as avgScore FROM Assessments GROUP BY type");

    // New Metrics
    const [dauRows] = await db.query("SELECT COUNT(DISTINCT user_id) as count FROM Progress WHERE DATE(last_accessed) = CURDATE()");
    const dau = dauRows[0].count;

    const [goalRows] = await db.query("SELECT COUNT(DISTINCT user_id) as count FROM Progress WHERE DATE(last_accessed) = CURDATE() AND status = 'Completed'");
    const completedToday = goalRows[0].count;
    const goalCompletionRate = dau > 0 ? Math.round((completedToday / dau) * 100) : 0;

    const [xpRows] = await db.query("SELECT SUM(xp) as totalXP FROM Users WHERE role = 'Student'");
    const totalXP = xpRows[0].totalXP || 0;

    const [topPerformers] = await db.query("SELECT name, xp, streak, avatar FROM Users WHERE role = 'Student' ORDER BY xp DESC LIMIT 5");

    const mostDifficultLessons = [...skillRows].sort((a, b) => a.avgScore - b.avgScore).slice(0, 5).map(skill => ({
      title: skill.skill + ' Exercises',
      avg_score: skill.avgScore
    }));

    res.status(200).json({
      totalStudents,
      avgScore,
      lessonsCompleted,
      languageDistribution: langRows,
      averageSkills: skillRows,
      dau,
      goalCompletionRate,
      totalXP,
      topPerformers,
      mostDifficultLessons,
      globalInsights: [
        "60% of students struggle with Grammar exercises.",
        "Vocabulary retention drops after Lesson 4.",
        "High engagement on weekends between 10 AM - 1 PM."
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

router.get('/students', verifyAdminToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        u.preferred_language,
        u.created_at,
        (SELECT COUNT(*) FROM Progress p WHERE p.user_id = u.user_id AND p.status = 'Completed') as lessons_completed,
        (SELECT AVG(score) FROM Assessments a WHERE a.user_id = u.user_id) as avg_score
      FROM Users u
      WHERE u.role = 'Student'
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [students] = await db.query(query, [limit, offset]);
    
    const countQuery = "SELECT COUNT(*) as count FROM Users WHERE role = 'Student'";
    const [countRows] = await db.query(countQuery);
    const totalUsers = countRows[0].count;
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({ 
      students, 
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching students' });
  }
});

router.get('/students/:id/details', verifyAdminToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const [user] = await db.query("SELECT user_id, name, email, preferred_language, proficiency_level, created_at FROM Users WHERE user_id = ?", [userId]);
    if (!user.length) return res.status(404).json({ message: 'Student not found' });
    
    const [completedLessons] = await db.query(`
      SELECT l.lesson_id, l.title, l.level, p.last_accessed 
      FROM Progress p 
      JOIN Lessons l ON p.lesson_id = l.lesson_id 
      WHERE p.user_id = ? AND p.status = 'Completed'
      ORDER BY p.last_accessed DESC
    `, [userId]);

    const [assessments] = await db.query("SELECT type, score, date FROM Assessments WHERE user_id = ? ORDER BY date DESC", [userId]);
    
    const [skills] = await db.query("SELECT type as skill, AVG(score) as avgScore FROM Assessments WHERE user_id = ? GROUP BY type", [userId]);

    res.status(200).json({
      profile: user[0],
      completedLessons,
      recentActivity: assessments.slice(0, 5),
      skillsProgress: skills
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching student details' });
  }
});

router.delete('/students/:id', verifyAdminToken, async (req, res) => {
  try {
    await db.query("DELETE FROM Users WHERE user_id = ? AND role = 'Student'", [req.params.id]);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting student' });
  }
});

const bcrypt = require('bcrypt');
router.post('/students', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, password, age, preferred_language, education_level, proficiency_level } = req.body;
    
    // Check if email already exists
    const [existing] = await db.query("SELECT email FROM Users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      `INSERT INTO Users (name, email, password_hash, age, preferred_language, education_level, proficiency_level, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Student')`,
      [name, email, hashedPassword, age || null, preferred_language || 'English', education_level || '', proficiency_level || 'Beginner']
    );

    res.status(201).json({ message: 'Student added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding student' });
  }
});

router.get('/lessons', verifyAdminToken, async (req, res) => {
  try {
    const [lessons] = await db.query(`
      SELECT l.*, 
        (SELECT COUNT(*) FROM Progress p WHERE p.lesson_id = l.lesson_id AND p.status = 'Completed') as completions
      FROM Lessons l
      ORDER BY l.level ASC, l.display_order ASC, l.created_at DESC
    `);
    res.status(200).json({ lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching lessons' });
  }
});

router.post('/lessons', verifyAdminToken, async (req, res) => {
  try {
    const { title, level, content_data } = req.body;
    await db.query("INSERT INTO Lessons (title, level, content_data) VALUES (?, ?, ?)", [title, level, JSON.stringify(content_data)]);
    res.status(201).json({ message: 'Lesson created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating lesson' });
  }
});

router.put('/lessons/:id', verifyAdminToken, async (req, res) => {
  try {
    const { title, level, content_data } = req.body;
    await db.query("UPDATE Lessons SET title = ?, level = ?, content_data = ? WHERE lesson_id = ?", [title, level, JSON.stringify(content_data), req.params.id]);
    res.status(200).json({ message: 'Lesson updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating lesson' });
  }
});

router.delete('/lessons/:id', verifyAdminToken, async (req, res) => {
  try {
    await db.query("DELETE FROM Lessons WHERE lesson_id = ?", [req.params.id]);
    res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting lesson' });
  }
});

router.put('/lessons/action/reorder', verifyAdminToken, async (req, res) => {
  try {
    const { updates } = req.body; // Array of { lesson_id, display_order }
    // Doing multiple updates in a simple loop because it's an admin action and array size is small
    for (const update of updates) {
      await db.query("UPDATE Lessons SET display_order = ? WHERE lesson_id = ?", [update.display_order, update.lesson_id]);
    }
    res.status(200).json({ message: 'Curriculum reordered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error reordering lessons' });
  }
});

router.get('/lessons/:id/completion', verifyAdminToken, async (req, res) => {
  try {
    const lessonId = req.params.id;
    const [students] = await db.query(`
      SELECT u.user_id, u.name, u.email,
        COALESCE(p.status, IF(a.status = 'Pending', 'Assigned', 'Not Started')) as completion_status
      FROM Users u
      LEFT JOIN Progress p ON u.user_id = p.user_id AND p.lesson_id = ?
      LEFT JOIN Assignments a ON u.user_id = a.user_id AND a.lesson_id = ?
      WHERE u.role = 'Student'
      ORDER BY u.name ASC
    `, [lessonId, lessonId]);

    res.status(200).json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching completion data' });
  }
});

router.post('/lessons/:id/assign', verifyAdminToken, async (req, res) => {
  try {
    const lessonId = req.params.id;
    const { user_id } = req.body;
    
    const [existing] = await db.query("SELECT * FROM Assignments WHERE user_id = ? AND lesson_id = ?", [user_id, lessonId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Lesson already assigned to this user' });
    }

    await db.query("INSERT INTO Assignments (user_id, lesson_id) VALUES (?, ?)", [user_id, lessonId]);
    res.status(201).json({ message: 'Lesson assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error assigning lesson' });
  }
});

// --- Announcements ---
router.get('/announcements', verifyAdminToken, async (req, res) => {
  try {
    const [announcements] = await db.query(`
      SELECT a.id, a.title, a.message, a.created_at, a.target_user_id, u.name as target_user_name 
      FROM Announcements a 
      LEFT JOIN Users u ON a.target_user_id = u.user_id 
      ORDER BY a.created_at DESC
    `);
    res.status(200).json({ announcements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching announcements' });
  }
});

router.post('/announcements', verifyAdminToken, async (req, res) => {
  try {
    const { title, message, target_user_id } = req.body;
    await db.query("INSERT INTO Announcements (title, message, target_user_id) VALUES (?, ?, ?)", [title, message, target_user_id || null]);
    res.status(201).json({ message: 'Announcement created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating announcement' });
  }
});

router.delete('/announcements/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM Announcements WHERE id = ?", [id]);
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting announcement' });
  }
});

// --- Activity Logs ---
router.get('/activity-logs', verifyAdminToken, async (req, res) => {
  try {
    // A query to get recent student joinings and lesson completions
    const query = `
      SELECT 'user_joined' as type, name as user_name, created_at as timestamp, '' as detail 
      FROM Users WHERE role = 'Student'
      UNION ALL
      SELECT 'lesson_completed' as type, u.name as user_name, p.last_accessed as timestamp, l.title as detail 
      FROM Progress p
      JOIN Users u ON p.user_id = u.user_id
      JOIN Lessons l ON p.lesson_id = l.lesson_id
      WHERE p.status = 'Completed'
      ORDER BY timestamp DESC
      LIMIT 20
    `;
    const [rows] = await db.query(query);
    res.status(200).json({ logs: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching activity logs' });
  }
});

// --- Settings ---
router.get('/settings', verifyAdminToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Platform_Settings");
    const settings = rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    res.status(200).json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

router.put('/settings', verifyAdminToken, async (req, res) => {
  try {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db.query("INSERT INTO Platform_Settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?", [key, value, value]);
    }
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

module.exports = router;
