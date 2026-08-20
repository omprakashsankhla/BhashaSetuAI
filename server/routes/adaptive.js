const express = require('express');
const db = require('../db');
const { GoogleGenAI } = require('@google/genai');
const jwt = require('jsonwebtoken');
const { scheduleReview, getAdaptiveRecommendations } = require('../services/adaptiveLearningService');
const { getAdaptiveLearningProfile } = require('../services/adaptive');
require('dotenv').config({ override: true });

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

const verifyToken = require('../middleware/auth');

// POST /api/adaptive/evaluate
// Analyzes performance and updates Learning_Profiles with new recommendations
router.post('/evaluate', verifyToken, async (req, res) => {
  const { activityType, scores, notes, language } = req.body;
  const userId = req.userId;

  if (!activityType || !scores) {
    return res.status(400).json({ message: 'Missing activityType or scores' });
  }

  try {
    // 1. Fetch or Create Learning Profile
    const [profiles] = await db.query('SELECT * FROM Learning_Profiles WHERE user_id = ?', [userId]);
    let profile = profiles.length > 0 ? profiles[0] : null;

    if (!profile) {
      await db.query('INSERT INTO Learning_Profiles (user_id) VALUES (?)', [userId]);
      const [newProfiles] = await db.query('SELECT * FROM Learning_Profiles WHERE user_id = ?', [userId]);
      profile = newProfiles[0];
    }

    // 2. Update quantitative scores dynamically based on activity type
    if (scores.vocabulary) await db.query('UPDATE Learning_Profiles SET vocabulary_score = vocabulary_score + ? WHERE user_id = ?', [scores.vocabulary, userId]);
    if (scores.reading) await db.query('UPDATE Learning_Profiles SET reading_score = reading_score + ? WHERE user_id = ?', [scores.reading, userId]);
    if (scores.listening) await db.query('UPDATE Learning_Profiles SET listening_score = listening_score + ? WHERE user_id = ?', [scores.listening, userId]);
    if (scores.speaking) await db.query('UPDATE Learning_Profiles SET speaking_score = speaking_score + ? WHERE user_id = ?', [scores.speaking, userId]);

    // 3. Re-fetch updated profile
    const [updatedProfiles] = await db.query('SELECT * FROM Learning_Profiles WHERE user_id = ?', [userId]);
    profile = updatedProfiles[0];

    // 4. Generate qualitative analysis & recommendations via Gemini
    const systemPrompt = `You are the BhashaSetu Adaptive Learning Engine. 
The user is learning ${language || 'a language'}.
Current Profile Scores:
Vocabulary: ${profile.vocabulary_score}
Reading: ${profile.reading_score}
Listening: ${profile.listening_score}
Speaking: ${profile.speaking_score}

Recent Activity: ${activityType}
Performance Notes: ${notes || 'Completed activity.'}

Analyze their performance and return ONLY a valid JSON object with the following schema:
{
  "weak_areas": ["array of specific weaknesses"],
  "strong_areas": ["array of specific strengths"],
  "recommendations": ["array of 3 specific actionable recommendations for their next activity"]
}`;

    let weak_areas = profile.weak_areas || [];
    let strong_areas = profile.strong_areas || [];
    let recommendations = profile.recommended_lessons || [];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: systemPrompt,
        config: { temperature: 0.2 }
      });
      
      const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysis = JSON.parse(text);
      
      weak_areas = analysis.weak_areas || weak_areas;
      strong_areas = analysis.strong_areas || strong_areas;
      recommendations = analysis.recommendations || recommendations;

      // Update qualitative insights
      await db.query(
        'UPDATE Learning_Profiles SET weak_areas = ?, strong_areas = ?, recommended_lessons = ? WHERE user_id = ?',
        [JSON.stringify(weak_areas), JSON.stringify(strong_areas), JSON.stringify(recommendations), userId]
      );
    } catch (aiErr) {
      console.error('[Adaptive Engine] Failed to parse Gemini evaluation:', aiErr);
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: {
        vocabulary_score: profile.vocabulary_score,
        reading_score: profile.reading_score,
        listening_score: profile.listening_score,
        speaking_score: profile.speaking_score,
        weak_areas,
        strong_areas,
        recommendations
      }
    });
  } catch (error) {
    console.error('[Adaptive Engine] Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/adaptive/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [profiles] = await db.query('SELECT * FROM Learning_Profiles WHERE user_id = ?', [req.userId]);
    if (profiles.length === 0) {
      return res.status(404).json({ message: 'No learning profile found.' });
    }
    return res.status(200).json(profiles[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST /api/adaptive/schedule-review
router.post('/schedule-review', verifyToken, async (req, res) => {
  const { itemType, itemId, rating } = req.body;
  if (!itemType || !itemId || rating === undefined) {
    return res.status(400).json({ message: 'Missing itemType, itemId, or rating' });
  }
  try {
    await scheduleReview(req.userId, itemType, itemId, rating);
    return res.status(200).json({ message: 'Item scheduled for review successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/adaptive/recommendations
router.get('/recommendations', verifyToken, async (req, res) => {
  try {
    const profile = await getAdaptiveLearningProfile(req.userId);
    return res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
