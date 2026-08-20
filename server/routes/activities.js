const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
const { translateOrAdaptContent, generateGameData } = require('./translationHelper');
require('dotenv').config({ override: true });

const router = express.Router();

const verifyToken = require('../middleware/auth');

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

const languageContext = require('../middleware/languageContext');

// GET /api/activities/game-data/:game
// Returns game vocab — first checks a local file, then falls back to AI-generated + cached data
router.get('/game-data/:game', verifyToken, languageContext, async (req, res) => {
  const { game } = req.params;
  const targetLang = req.learningLanguage;
  const interfaceLang = req.interfaceLanguage;

  // 1. Try loading a pre-built local dataset file first (preserves existing files)
  const datasetPath = path.join(__dirname, '../data/games', `${game}_${targetLang}.json`);
  if (fs.existsSync(datasetPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      return res.json(data);
    } catch (e) {
      console.warn(`[Game Data] Failed to parse ${datasetPath}:`, e.message);
    }
  }

  // 2. Use the cache-aware AI generator from translationHelper
  try {
    const data = await generateGameData(game, targetLang, interfaceLang);
    if (data) {
      return res.json(data);
    }
  } catch (err) {
    console.error(`[Game Data] generateGameData failed for ${game}/${targetLang}:`, err.message);
  }

  // 3. Final fallback: English dataset
  const fallbackPath = path.join(__dirname, '../data/games', `${game}_en.json`);
  if (fs.existsSync(fallbackPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      return res.json(data);
    } catch (e) {
      console.warn(`[Game Data] Failed to parse English fallback:`, e.message);
    }
  }

  return res.status(500).json({ message: `Missing game dataset for ${game}` });
});

// GET /api/activities/:type
// Returns data for a specific activity type translated and adapted dynamically
router.get('/:type', verifyToken, languageContext, async (req, res) => {
  const { type } = req.params;
  const targetLang = req.learningLanguage;
  const interfaceLang = req.interfaceLanguage;

  // Try to load the localized bank if it exists (for backward compatibility / override),
  // otherwise load the master English bank and translate dynamically.
  const localizedBankName = `${type}Bank_${targetLang}.json`;
  let data = loadBank(localizedBankName);

  if (!data || data.length === 0) {
    data = loadBank(`${type}Bank.json`);
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ message: `No data found for activity type: ${type}` });
  }

  // Only translate dynamically if we loaded the default English bank, and target/interface are not both English
  const isMasterBank = !fs.existsSync(path.join(__dirname, '../data', localizedBankName));
  if (isMasterBank && (targetLang !== 'en' || interfaceLang !== 'en')) {
    try {
      console.log(`[Activities] Translating activity: ${type} to Learning: ${targetLang}, Interface: ${interfaceLang}`);
      data = await translateOrAdaptContent(data, targetLang, interfaceLang, type);
    } catch (err) {
      console.error(`AI Activity Translation failed for ${type}:`, err.message);
    }
  }

  let items = data;
  if (type === 'picture-match') {
    const count = parseInt(req.query.count) || 8;
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    items = shuffled.slice(0, count);
  }

  return res.json({ items });
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
        model: 'gemini-3.5-flash',
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
