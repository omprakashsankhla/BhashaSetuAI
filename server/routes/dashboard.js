const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { GoogleGenAI } = require('@google/genai');
const { translateOrAdaptContent } = require('./translationHelper');

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

async function generateContentWithRetry(options, maxRetries = 4) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(options);
    } catch (err) {
      attempt++;
      const msg = err.message || '';
      const isRateLimitOrUnavailable = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE') || msg.includes('high demand');
      
      if (isRateLimitOrUnavailable && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`[API Demand Limit] Retrying in ${Math.round(delay)}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

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

// Helper: Derive rank from XP
function getRank(xp) {
  if (xp >= 3000) return 'Platinum Master';
  if (xp >= 1500) return 'Gold Scholar';
  if (xp >= 500) return 'Silver Explorer';
  return 'Bronze Learner';
}

// Helper: Derive achievements from real data
function deriveAchievements(stats, completedCount, hasVoiceAssessment) {
  return [
    {
      id: 'first_lesson',
      icon: '📖',
      title: 'First Steps',
      desc: 'Complete your first lesson',
      target: 1,
      current: completedCount,
      unlocked: completedCount >= 1
    },
    {
      id: 'streak_7',
      icon: '🔥',
      title: 'Streak Explorer',
      desc: 'Maintain a 7-day learning streak',
      target: 7,
      current: stats.streak,
      unlocked: stats.streak >= 7
    },
    {
      id: 'xp_1000',
      icon: '⭐',
      title: 'XP Scholar',
      desc: 'Accumulate 1000 XP points',
      target: 1000,
      current: stats.xp,
      unlocked: stats.xp >= 1000
    },
    {
      id: 'pronunciation',
      icon: '🎤',
      title: 'Speaking Star',
      desc: 'Complete a voice assessment',
      target: 1,
      current: hasVoiceAssessment ? 1 : 0,
      unlocked: hasVoiceAssessment
    },
    {
      id: 'reading_10',
      icon: '📚',
      title: 'Reading Champion',
      desc: 'Complete 10 lessons',
      target: 10,
      current: completedCount,
      unlocked: completedCount >= 10
    },
    {
      id: 'streak_30',
      icon: '👑',
      title: '30 Day Legend',
      desc: 'Maintain a 30-day learning streak',
      target: 30,
      current: stats.streak,
      unlocked: stats.streak >= 30
    },
    {
      id: 'coins_500',
      icon: '💰',
      title: 'Coin Collector',
      desc: 'Collect 500 BhashaSetu coins',
      target: 500,
      current: stats.coins,
      unlocked: stats.coins >= 500
    },
    {
      id: 'course_complete',
      icon: '🏆',
      title: 'Course Graduate',
      desc: 'Complete 30 lessons',
      target: 30,
      current: completedCount,
      unlocked: completedCount >= 30
    }
  ];
}

// The 30 lessons grouped into 4 units (matching the curriculum in assessment.js)
const UNIT_DEFINITIONS = [
  { name: 'Unit 1', lessonIndices: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'Unit 2', lessonIndices: [7, 8, 9, 10, 11, 12, 13] },
  { name: 'Unit 3', lessonIndices: [14, 15, 16, 17, 18, 19, 20] },
  { name: 'Unit 4', lessonIndices: [21, 22, 23, 24, 25, 26, 27, 28, 29] }
];

router.get('/data', verifyToken, async (req, res) => {
  try {
    // 1. Fetch user data
    const [users] = await db.query('SELECT name, preferred_language, education_level, xp, coins, streak, last_login, hearts, hearts_last_regen, avatar, settings, skills_progress FROM Users WHERE user_id = ?', [req.userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users[0];

    // Hearts regeneration: 1 heart every 30 minutes, max 5
    let currentHearts = user.hearts ?? 5;
    if (currentHearts < 5 && user.hearts_last_regen) {
      const lastRegen = new Date(user.hearts_last_regen);
      const now = new Date();
      const minutesElapsed = Math.floor((now - lastRegen) / (1000 * 60));
      const heartsToRegen = Math.floor(minutesElapsed / 30);
      if (heartsToRegen > 0) {
        currentHearts = Math.min(5, currentHearts + heartsToRegen);
        await db.query('UPDATE Users SET hearts = ?, hearts_last_regen = NOW() WHERE user_id = ?', [currentHearts, req.userId]);
      }
    }

    const stats = {
      streak: user.streak || 0, 
      coins: user.coins || 0, 
      xp: user.xp || 0,
      hearts: currentHearts
    };

    // 2. Fetch all lessons with progress
    const [progressRows] = await db.query(`
      SELECT p.lesson_id as id, l.title, l.level,
             JSON_UNQUOTE(JSON_EXTRACT(l.content_data, '$.type')) as type, 
             p.status, p.completed_at,
             p.progress_id
      FROM Progress p
      JOIN Lessons l ON p.lesson_id = l.lesson_id
      WHERE p.user_id = ?
      ORDER BY p.progress_id ASC
    `, [req.userId]);

    let rawLessons = progressRows.map(r => ({
      id: r.id,
      title: r.title,
      level: r.level,
      type: r.type || 'reading',
      status: r.status,
      completedAt: r.completed_at
    }));

    // Enforce sequential unlocking dynamically across the entire learning path.
    // A lesson is only unlocked (active/completed) if all previous lessons are completed.
    let allPreviousCompleted = true;
    let lessons = rawLessons.map((l) => {
      const isCompleted = (l.status === 'Completed' || l.status === 'completed');
      let finalStatus = 'locked';

      if (allPreviousCompleted) {
        if (isCompleted) {
          finalStatus = 'completed';
        } else {
          finalStatus = 'active';
          allPreviousCompleted = false; // first incomplete lesson is active, everything after is locked
        }
      } else {
        finalStatus = 'locked';
      }

      return {
        id: l.id,
        title: l.title,
        level: l.level,
        type: l.type,
        status: finalStatus,
        completedAt: l.completedAt
      };
    });

    // Edge case if user hasn't taken assessment
    if (lessons.length === 0) {
      lessons = [
        { id: 0, title: 'Take Assessment to Unlock Path', type: 'reading', status: 'locked', level: 'Beginner' }
      ];
    }

    const targetLang = user.preferred_language || 'hi';
    const interfaceLang = req.query.interfaceLang || targetLang;

    // Translate lesson titles
    try {
      const lessonsToTranslate = lessons.map(l => ({ title: l.title }));
      const translatedMeta = await translateOrAdaptContent(lessonsToTranslate, targetLang, interfaceLang, 'lesson_meta');
      lessons.forEach((l, idx) => {
        if (translatedMeta[idx]) {
          l.title = translatedMeta[idx].title;
        }
      });
    } catch (e) {
      console.error('Failed to translate lesson titles in dashboard:', e);
    }

    // 3. Compute currentLesson — first lesson with status 'active'
    const currentLesson = lessons.find(l => l.status === 'active') || null;
    const currentLessonIndex = currentLesson ? lessons.findIndex(l => l.id === currentLesson.id) : -1;

    // 4. Compute Today's Goal — XP earned today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lessonsCompletedToday = lessons.filter(l => {
      if (!l.completedAt) return false;
      const completedDate = new Date(l.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    }).length;
    const xpEarnedToday = lessonsCompletedToday * 20; // 20 XP per lesson
    const dailyXpTarget = 60;

    const todaysGoal = {
      earned: xpEarnedToday,
      target: dailyXpTarget
    };

    // 5. Compute dayNumber — days since first lesson was created
    let dayNumber = 1;
    if (progressRows.length > 0) {
      // Use the earliest progress entry as "start date"
      const [firstProgress] = await db.query(
        `SELECT MIN(created_at) as start_date FROM Progress WHERE user_id = ?`, 
        [req.userId]
      );
      if (firstProgress[0] && firstProgress[0].start_date) {
        const startDate = new Date(firstProgress[0].start_date);
        startDate.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        dayNumber = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;
        if (dayNumber > 30) dayNumber = 30;
        if (dayNumber < 1) dayNumber = 1;
      }
    }

    // 6. Compute unitProgress — group lessons into units per level
    const completedCount = lessons.filter(l => l.status === 'completed').length;
    
    const unitProgress = {};
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    for (const lvl of levels) {
      const trackLessons = lessons.filter(l => l.level === lvl);
      
      unitProgress[lvl] = UNIT_DEFINITIONS.map((unit, unitIdx) => {
        const unitLessons = unit.lessonIndices.map(i => {
          if (i < trackLessons.length) return trackLessons[i];
          return { title: 'Upcoming Lesson', status: 'locked', type: 'locked' };
        }).filter(l => l.title !== 'Upcoming Lesson'); // Don't show placeholders if the track is shorter (e.g. 28 lessons)
        
        const completedInUnit = unitLessons.filter(l => l.status === 'completed').length;
        const totalInUnit = unitLessons.length;
        const hasActive = unitLessons.some(l => l.status === 'active');
        
        let unitStatus = 'locked';
        if (completedInUnit === totalInUnit && totalInUnit > 0) {
          unitStatus = 'completed';
        } else if (hasActive || completedInUnit > 0) {
          unitStatus = 'current';
        } else if (unitIdx === 0) {
          unitStatus = 'current'; // First unit is always at least current
        }

        return {
          name: unit.name,
          status: unitStatus,
          completedLessons: completedInUnit,
          totalLessons: totalInUnit,
          lessons: unitLessons.map(l => ({ id: l.id || null, title: l.title, status: l.status }))
        };
      });
    }

    // 7. Compute achievements
    const [voiceRows] = await db.query(
      `SELECT COUNT(*) as count FROM Voice_Assessments WHERE user_id = ?`, 
      [req.userId]
    ).catch(() => [[{ count: 0 }]]);
    const hasVoiceAssessment = (voiceRows[0]?.count || 0) > 0;

    const achievements = deriveAchievements(stats, completedCount, hasVoiceAssessment);

    // 8. Compute rank
    const rank = getRank(stats.xp);

    // 9. Compute leaderboard — top 5 users by XP
    const [leaderboardRows] = await db.query(
      `SELECT name, xp, avatar FROM Users ORDER BY xp DESC LIMIT 5`
    );
    const leaderboard = leaderboardRows.map((row, idx) => ({
      rank: idx + 1,
      name: row.name,
      avatar: row.avatar,
      xp: row.xp || 0,
      isCurrentUser: row.name === user.name
    }));

    // 10. Compute skill analysis from granular skills_progress
    let parsedSkillsProgress = {};
    if (user.skills_progress) {
      try {
        parsedSkillsProgress = typeof user.skills_progress === 'string' 
          ? JSON.parse(user.skills_progress) 
          : user.skills_progress;
      } catch(e) {}
    }

    const calcPercent = (skillObj) => {
      if (!skillObj || skillObj.total === 0) return 0;
      return Math.round((skillObj.correct / skillObj.total) * 100);
    };

    const skillAnalysis = {
      reading: calcPercent(parsedSkillsProgress.reading),
      writing: calcPercent(parsedSkillsProgress.writing),
      speaking: calcPercent(parsedSkillsProgress.speaking),
      listening: calcPercent(parsedSkillsProgress.listening),
      vocabulary: calcPercent(parsedSkillsProgress.vocabulary),
      grammar: calcPercent(parsedSkillsProgress.grammar)
    };

    // 11. Today's tasks status
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todaysTasks = {
      lessonCompleted: lessonsCompletedToday >= 1,
      gameCompleted: parsedSkillsProgress.last_game_date === todayStr,
      speakingDone: hasVoiceAssessment, // Simplified: if they ever did voice assessment
      activityCompleted: parsedSkillsProgress.last_activity_date === todayStr
    };

    // 12. Fetch Admin Assigned Tasks
    const [assignedRows] = await db.query(`
      SELECT a.assignment_id, a.lesson_id, l.title, a.status 
      FROM Assignments a
      JOIN Lessons l ON a.lesson_id = l.lesson_id
      WHERE a.user_id = ? AND a.status = 'Pending'
    `, [req.userId]);

    const assignedTasks = assignedRows.map(r => ({
      assignmentId: r.assignment_id,
      lessonId: r.lesson_id,
      title: r.title,
      status: r.status
    }));

    try {
      const translatedAssigned = await translateOrAdaptContent(assignedTasks.map(t => ({ title: t.title })), targetLang, interfaceLang, 'lesson_meta');
      assignedTasks.forEach((t, idx) => {
        if (translatedAssigned[idx]) {
          t.title = translatedAssigned[idx].title;
        }
      });
    } catch (e) {
      console.error('Failed to translate assigned tasks in dashboard:', e);
    }

    // 13. Fetch Announcements
    const [announcementsRows] = await db.query(
      `SELECT id, title, message, created_at FROM Announcements WHERE target_user_id IS NULL OR target_user_id = ? ORDER BY created_at DESC LIMIT 5`,
      [req.userId]
    );

    res.status(200).json({ 
      user, 
      stats, 
      lessons, 
      currentLesson,
      todaysGoal,
      dayNumber,
      unitProgress,
      achievements,
      rank,
      leaderboard,
      skillAnalysis,
      todaysTasks,
      assignedTasks,
      announcements: announcementsRows,
      settings: typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard data' });
  }
});

// Dedicated Leaderboard endpoint
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT name, avatar FROM Users WHERE user_id = ?', [req.userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users[0];

    const [leaderboardRows] = await db.query(
      `SELECT name, xp, avatar FROM Users ORDER BY xp DESC LIMIT 100`
    );
    
    const leaderboard = leaderboardRows.map((row, idx) => ({
      rank: idx + 1,
      name: row.name,
      avatar: row.avatar,
      xp: row.xp || 0,
      isCurrentUser: row.name === user.name
    }));

    // If current user is not in top 50, fetch their rank specifically
    let currentUserRank = leaderboard.find(l => l.isCurrentUser);
    if (!currentUserRank) {
      // Find exact rank of current user
      const [rankRows] = await db.query(`
        SELECT COUNT(*) + 1 as rank
        FROM Users
        WHERE xp > (SELECT xp FROM Users WHERE user_id = ?)
      `, [req.userId]);
      
      const [userRows] = await db.query('SELECT xp, avatar FROM Users WHERE user_id = ?', [req.userId]);
      
      currentUserRank = {
        rank: rankRows[0].rank,
        name: user.name,
        avatar: userRows[0].avatar,
        xp: userRows[0].xp || 0,
        isCurrentUser: true
      };
    }

    res.status(200).json({ leaderboard, currentUser: currentUserRank });
  } catch (error) {
    console.error('Leaderboard Error:', error);
    res.status(500).json({ message: 'Server error retrieving leaderboard data' });
  }
});

// AI Insight endpoint — separate to avoid slowing down dashboard load
router.get('/ai-insight', verifyToken, async (req, res) => {
  try {
    // Fetch user's recent lesson data and skills progress
    const [users] = await db.query('SELECT name, preferred_language, xp, skills_progress FROM Users WHERE user_id = ?', [req.userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users[0];

    const [recentLessons] = await db.query(`
      SELECT l.title, JSON_UNQUOTE(JSON_EXTRACT(l.content_data, '$.type')) as type, p.status
      FROM Progress p
      JOIN Lessons l ON p.lesson_id = l.lesson_id
      WHERE p.user_id = ?
      ORDER BY p.progress_id DESC
      LIMIT 10
    `, [req.userId]);

    // Fetch voice assessment scores if any
    const [voiceScores] = await db.query(
      `SELECT pronunciation_score, fluency_score, accuracy_score 
       FROM Voice_Assessments WHERE user_id = ? 
       ORDER BY assessment_id DESC LIMIT 3`,
      [req.userId]
    ).catch(() => [[]]);

    // Fetch all available lessons to recommend from
    const [allLessons] = await db.query('SELECT title, level FROM Lessons ORDER BY display_order ASC');
    const availableLessonsStr = allLessons.map(l => `${l.title} (${l.level})`).join(', ');

    const completedRecent = recentLessons.filter(l => l.status === 'Completed' || l.status === 'completed');
    const pendingRecent = recentLessons.filter(l => l.status !== 'Completed' && l.status !== 'completed');

    let parsedSkillsProgress = {};
    if (user.skills_progress) {
      try { parsedSkillsProgress = typeof user.skills_progress === 'string' ? JSON.parse(user.skills_progress) : user.skills_progress; } catch(e) {}
    }

    const calcPercent = (skillObj) => skillObj && skillObj.total > 0 ? Math.round((skillObj.correct / skillObj.total) * 100) : 0;
    const skillAnalysis = {
      reading: calcPercent(parsedSkillsProgress.reading),
      writing: calcPercent(parsedSkillsProgress.writing),
      speaking: calcPercent(parsedSkillsProgress.speaking),
      listening: calcPercent(parsedSkillsProgress.listening),
      vocabulary: calcPercent(parsedSkillsProgress.vocabulary),
      grammar: calcPercent(parsedSkillsProgress.grammar)
    };

    const prompt = `You are an AI language learning advisor. Based on the following student data, provide TWO short insights:

Student: ${user.name}, Learning language: ${user.preferred_language}, Total XP: ${user.xp}
Detailed Skill Breakdown (Actual correct answer % across all activities):
- Reading: ${skillAnalysis.reading}%
- Writing: ${skillAnalysis.writing}%
- Speaking: ${skillAnalysis.speaking}%
- Listening: ${skillAnalysis.listening}%
- Vocabulary: ${skillAnalysis.vocabulary}%
- Grammar: ${skillAnalysis.grammar}%

Recent completed lessons: ${completedRecent.map(l => l.title).join(', ') || 'None yet'}
Pending lessons: ${pendingRecent.map(l => l.title).join(', ') || 'None'}
Voice assessment scores: ${voiceScores.length > 0 ? voiceScores.map(v => `Pronunciation: ${v.pronunciation_score}, Fluency: ${v.fluency_score}`).join('; ') : 'No voice assessments yet'}

Available Learning Content (Recommend ONE from this list based on their weak areas):
${availableLessonsStr || 'No lessons available.'}

Return a JSON object with exactly two keys:
1. "recommendation": A 1-sentence actionable tip for what to focus on next (max 15 words). Include the title of an available lesson.
2. "feedback": A 1-sentence specific observation about their weak area or a common mistake pattern (max 20 words).

Be specific and encouraging. Output strictly valid JSON, no markdown.`;

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: "OBJECT",
            properties: {
              recommendation: { type: "STRING" },
              feedback: { type: "STRING" }
            },
            required: ["recommendation", "feedback"]
          }
        }
      });

      let rawText = response.text || '';
      rawText = rawText.trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(rawText);
      res.status(200).json({ 
        recommendation: parsed.recommendation || "Keep practicing daily to build momentum!",
        feedback: parsed.feedback || "Focus on completing your current lesson before moving on."
      });
    } catch (aiError) {
      console.error('AI Insight generation error:', aiError.message);
      // Fallback insights based on data
      let recommendation = "Complete today's lesson to stay on track!";
      let feedback = "Consistent daily practice is your strongest habit builder.";
      
      if (voiceScores.length > 0 && voiceScores[0].pronunciation_score < 70) {
        recommendation = "Practice pronunciation — try the Speaking lessons.";
        feedback = "Your pronunciation scores suggest more speaking practice would help.";
      } else if (completedRecent.length === 0) {
        recommendation = "Start your first lesson today to begin earning XP!";
        feedback = "Taking the first step is the hardest — you've got this!";
      }
      
      res.status(200).json({ recommendation, feedback });
    }
  } catch (error) {
    console.error('AI Insight Error:', error);
    res.status(200).json({ 
      recommendation: "Keep learning daily!", 
      feedback: "Practice makes perfect." 
    });
  }
});

router.post('/award-coins', verifyToken, async (req, res) => {
  const { coins } = req.body;
  if (coins === undefined || isNaN(coins)) {
    return res.status(400).json({ message: 'Invalid coins parameter' });
  }
  try {
    await db.query('UPDATE Users SET coins = coins + ? WHERE user_id = ?', [Math.round(coins), req.userId]);
    res.status(200).json({ message: 'Coins awarded successfully', coinsAwarded: Math.round(coins) });
  } catch (err) {
    console.error('Error awarding coins:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
