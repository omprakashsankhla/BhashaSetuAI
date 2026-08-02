const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
const { translateOrAdaptContent, generateGameData } = require('./translationHelper');
require('dotenv').config({ override: true });

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

// Load all activity data banks
const loadBank = (filename) => {
  try {
    const filePath = path.join(__dirname, '../data', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Failed to load ${filename}:`, err.message);
    return [];
  }
};

const banks = {
  'picture-match': loadBank('pictureMatchBank.json'),
  'conversation-sim': loadBank('conversationSimBank.json'),
  'audio-comp': loadBank('audioCompBank.json'),
  'speech-prep': loadBank('speechPrepBank.json'),
  'article-translation': loadBank('articleTranslationBank.json')
};

// GET /api/activities/game-data/:game
// Returns dynamically generated game vocab / dialogues using Gemini
router.get('/game-data/:game', async (req, res) => {
  const { game } = req.params;
  const targetLang = req.query.lang || 'hi';
  const interfaceLang = req.query.interfaceLang || 'en';

  const data = await generateGameData(game, targetLang, interfaceLang);
  if (!data) {
    return res.status(500).json({ message: `Failed to generate game data for ${game}` });
  }

  return res.json(data);
});

// GET /api/activities/:type
// Returns data for a specific activity type
router.get('/:type', async (req, res) => {
  const { type } = req.params;
  const data = banks[type];

  if (!data || data.length === 0) {
    return res.status(404).json({ message: `No data found for activity type: ${type}` });
  }

  const targetLang = req.query.lang || 'hi';
  const interfaceLang = req.query.interfaceLang || 'en';

  let items = data;
  if (type === 'picture-match') {
    const count = parseInt(req.query.count) || 8;
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    items = shuffled.slice(0, count);
  }

  const translatedItems = await translateOrAdaptContent(items, targetLang, interfaceLang, type);

  return res.json({ items: translatedItems });
});

// POST /api/activities/chat
// Conversation Simulator — accepts a scenario systemPrompt + conversation history
router.post('/chat', verifyToken, async (req, res) => {
  require('dotenv').config({ override: true });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const openaiFallback = new OpenAI({ apiKey: process.env.OPENAI_FALLBACK_API_KEY || 'MISSING_API_KEY' });
  const fallbackAi = new GoogleGenAI({ apiKey: process.env.GEMINI_TUTOR_FALLBACK_API_KEY || process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

  const { systemPrompt, messages } = req.body;

  if (!systemPrompt || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'systemPrompt and messages[] are required' });
  }

  const openAiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  try {
    const gptRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openAiMessages
    });
    return res.json({ reply: gptRes.choices[0].message.content });
  } catch (err1) {
    console.error('ConvSim OpenAI error:', err1.message);
    try {
      const prompt = `System instructions: ${systemPrompt}\n\nConversation:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;
      const geminiRes = await fallbackAi.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      return res.json({ reply: geminiRes.text });
    } catch (err2) {
      console.error('ConvSim Gemini fallback error:', err2.message);
      try {
        const finalRes = await openaiFallback.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: openAiMessages
        });
        return res.json({ reply: finalRes.choices[0].message.content });
      } catch (err3) {
        console.error('ConvSim final fallback error:', err3.message);
        return res.status(500).json({ message: 'Failed to generate AI response. Please try again.' });
      }
    }
  }
});

module.exports = router;
