const express = require('express');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
const db = require('../db');
const { isPromptSafe, GUARDRAIL_SYSTEM_PROMPT } = require('../utils/guardrails');
const { auditInputSafety, auditOutputSafety } = require('../services/safety');
const { logAuditEvent } = require('../services/auditLogger');
const { withTimeout } = require('../utils/withTimeout');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ override: true });

const router = express.Router();

const { rateLimitStore } = require('../services/redisClient');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  keyGenerator: (req) => req.userId || 'anonymous',
  message: { message: 'Too many messages. Please slow down.' },
  store: rateLimitStore
});

const verifyToken = require('../middleware/auth');

const languageContext = require('../middleware/languageContext');

router.post('/chat', verifyToken, chatLimiter, languageContext, async (req, res) => {
  require('dotenv').config({ override: true });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const openaiFallback = new OpenAI({ apiKey: process.env.OPENAI_FALLBACK_API_KEY || 'MISSING_API_KEY' });
  const fallbackAi = new GoogleGenAI({ apiKey: process.env.GEMINI_TUTOR_FALLBACK_API_KEY || process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

  const { message, language, history } = req.body;

  async function sendAuditedReply(req, res, rawReply) {
    const outputCheck = auditOutputSafety(rawReply);
    const safeReply = outputCheck.clean ? outputCheck.sanitized : 'I can only provide educational feedback.';
    if (!outputCheck.clean) {
      await logAuditEvent(req.userId || null, 'AI_RESPONSE_BLOCKED', { reply: rawReply, reason: outputCheck.reason }, req.ip);
    }
    return res.status(200).json({ reply: safeReply });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Layer 1 Protection: Prompt Firewall injection/safety audit
  const inputCheck = auditInputSafety(message);
  if (!inputCheck.clean) {
    await logAuditEvent(req.userId || null, 'AI_PROMPT_BLOCKED', { message, reason: inputCheck.reason }, req.ip);
    return res.json({ reply: 'I can only help with language learning and educational activities.' });
  }

  // Layer 1 Protection: Regex-based prompt sanitization
  if (!isPromptSafe(message)) {
    return res.json({ reply: 'I can only help with language learning and educational activities.' });
  }

  // Fetch user's name and preferred language for personalization
  let userName = 'Student';
  let assessmentScore = null;
  let currentLessonTitle = null;

  let aiInsights = null;

  try {
    const [users] = await db.query('SELECT name, settings FROM Users WHERE user_id = ?', [req.userId]);
    if (users.length > 0) {
      userName = users[0].name.split(' ')[0];
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

  const systemPrompt = `You are BhashaSetu, a friendly, encouraging AI language tutor.
The student's name is "${userName}".
Interface Language = ${req.interfaceLanguage}
Learning Language = ${req.learningLanguage}

RULES:
1. You must EXPLAIN concepts, answer doubts, and give feedback entirely in the Interface Language (${req.interfaceLanguage}).
2. You must TEACH and provide examples entirely in the Learning Language (${req.learningLanguage}).
3. Never mix them. Keep your responses short, supportive, and conversational (max 2-3 sentences).${additionalContext}

${GUARDRAIL_SYSTEM_PROMPT}`;

  try {
    const response = await withTimeout(
      fallbackAi.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
          { role: 'user', parts: [{ text: `System instructions: ${systemPrompt}\n\nUser message: ${message}` }] }
        ]
      }),
      15000,
      'Gemini Tutor'
    );
    return await sendAuditedReply(req, res, response.text);
  } catch (geminiError) {
    console.error('Gemini Tutor Error:', geminiError.message);
    try {
      console.log('Attempting AI Tutor fallback using OpenAI...');
      const gptRes = await withTimeout(
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ]
        }),
        15000,
        'OpenAI Tutor'
      );
      return await sendAuditedReply(req, res, gptRes.choices[0].message.content);
    } catch (openaiError) {
      console.error('OpenAI Tutor Fallback Error:', openaiError.message);
      res.status(500).json({ message: 'Error generating response from BhashaSetu. Please try again.' });
    }
  }
});

module.exports = router;
