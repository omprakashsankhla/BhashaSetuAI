const express = require('express');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
const db = require('../db');
const { isPromptSafe, GUARDRAIL_SYSTEM_PROMPT } = require('../utils/guardrails');
require('dotenv').config({ override: true });

const router = express.Router();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized!' });
    req.userId = decoded.user_id;
    next();
  });
};

router.post('/chat', verifyToken, async (req, res) => {
  require('dotenv').config({ override: true });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const openaiFallback = new OpenAI({ apiKey: process.env.OPENAI_FALLBACK_API_KEY || 'MISSING_API_KEY' });
  const fallbackAi = new GoogleGenAI({ apiKey: process.env.GEMINI_TUTOR_FALLBACK_API_KEY || process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

  const { message, language } = req.body;
  
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  // Layer 1 Protection: Regex-based prompt sanitization
  if (!isPromptSafe(message)) {
    return res.json({ reply: 'I can only help with language learning and educational activities.' });
  }

  // Fetch user's name and preferred language for personalization
  let userName = 'Student';
  let userLang = language || 'en';
  let assessmentScore = null;
  let currentLessonTitle = null;

  let aiInsights = null;

  try {
    const [users] = await db.query('SELECT name, preferred_language, settings FROM Users WHERE user_id = ?', [req.userId]);
    if (users.length > 0) {
      userName = users[0].name.split(' ')[0];
      userLang = users[0].preferred_language || language || 'en';
      if (users[0].settings) {
        const settings = typeof users[0].settings === 'string' ? JSON.parse(users[0].settings) : users[0].settings;
        aiInsights = settings.ai_insights || null;
      }
    }

    // Get latest assessment score
    const [assessments] = await db.query('SELECT score FROM Assessments WHERE user_id = ? ORDER BY date DESC LIMIT 1', [req.userId]);
    if (assessments.length > 0) {
      assessmentScore = assessments[0].score;
    }

    // Get current lesson
    const [progressRows] = await db.query(`
      SELECT l.title 
      FROM Progress p
      JOIN Lessons l ON p.lesson_id = l.lesson_id
      WHERE p.user_id = ? AND p.status = 'In Progress'
      LIMIT 1
    `, [req.userId]);

    if (progressRows.length > 0) {
      currentLessonTitle = progressRows[0].title;
    }
  } catch (e) {
    console.error('Error fetching context for tutor:', e);
  }

  let additionalContext = "";
  if (assessmentScore !== null || currentLessonTitle || aiInsights) {
    additionalContext = `\nHere is some context about the user's progress:\n`;
    if (assessmentScore !== null) additionalContext += `- Latest Assessment Score: ${assessmentScore}\n`;
    if (currentLessonTitle) additionalContext += `- Currently learning lesson: "${currentLessonTitle}"\n`;
    if (aiInsights) {
      additionalContext += `- User Strengths: ${aiInsights.strengths?.join(', ')}\n`;
      additionalContext += `- User Weaknesses to improve: ${aiInsights.weaknesses?.join(', ')}\n`;
      additionalContext += `- AI Recommended Focus: ${aiInsights.recommended_focus}\n`;
    }
    additionalContext += `Proactively suggest a specific practice task or mini-exercise related to their current lesson or based on their assessment performance. Keep the exercise very short and interactive!`;
  }

  const systemPrompt = `You are BhashaSetu, a friendly, encouraging AI language tutor helping beginners learn. 
Your goal is to answer doubts, practice speaking, and explain basic language concepts clearly and simply.
The student's name is "${userName}". Their native language is '${userLang}'. 
Try to communicate clearly, providing translation and pronunciation tips when helpful.
Keep your responses short, supportive, and conversational (max 2-3 sentences per reply).
If they ask about grammar, vocabulary, or pronunciation, give clear examples.${additionalContext}

${GUARDRAIL_SYSTEM_PROMPT}`;

  try {
    const gptRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });
    
    const reply = gptRes.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (openaiError) {
    console.error('OpenAI Tutor Error:', openaiError.message);
    
    try {
      console.log('Attempting AI Tutor fallback using Gemini fallbackAi...');
      const responseFallback = await fallbackAi.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts: [{ text: `System instructions: ${systemPrompt}\n\nUser message: ${message}` }] }
        ]
      });

      const reply = responseFallback.text;
      res.status(200).json({ reply });
    } catch (fallbackErr) {
      console.error('Gemini Tutor Fallback Error:', fallbackErr.message);
      
      try {
        console.log('Attempting AI Tutor fallback of fallback using openaiFallback...');
        const finalRes = await openaiFallback.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        });
        
        const reply = finalRes.choices[0].message.content;
        res.status(200).json({ reply });
      } catch (finalErr) {
        console.error('Final OpenAI Fallback Error:', finalErr.message);
        res.status(500).json({ message: 'Error generating response from BhashaSetu. Please try again.' });
      }
    }
  }
});

module.exports = router;
