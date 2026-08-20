const express = require('express');
const db = require('../db');
const cacheService = require('../services/redisClient');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

// GET /api/health (overall status)
router.get('/', async (req, res) => {
  const start = Date.now();
  const checks = {
    db: 'unknown',
    redis: 'unknown',
    ai: 'unknown'
  };

  try {
    await db.query('SELECT 1');
    checks.db = 'healthy';
  } catch (e) {
    checks.db = 'unhealthy';
  }

  if (cacheService.redisClient) {
    try {
      await cacheService.redisClient.ping();
      checks.redis = 'healthy';
    } catch (e) {
      checks.redis = 'unhealthy';
    }
  } else {
    checks.redis = 'fallback_active';
  }

  if (process.env.GEMINI_API_KEY) {
    checks.ai = 'configured';
  } else {
    checks.ai = 'unconfigured';
  }

  const duration = Date.now() - start;
  const isHealthy = checks.db === 'healthy' && checks.redis !== 'unhealthy';

  return res.status(isHealthy ? 200 : 500).json({
    status: isHealthy ? 'healthy' : 'degraded',
    checks,
    latencyMs: duration
  });
});

// GET /api/health/db
router.get('/db', async (req, res) => {
  const start = Date.now();
  try {
    await db.query('SELECT 1');
    return res.status(200).json({ status: 'healthy', latencyMs: Date.now() - start });
  } catch (err) {
    return res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// GET /api/health/redis
router.get('/redis', async (req, res) => {
  const start = Date.now();
  if (cacheService.redisClient) {
    try {
      await cacheService.redisClient.ping();
      return res.status(200).json({ status: 'healthy', latencyMs: Date.now() - start });
    } catch (err) {
      return res.status(500).json({ status: 'unhealthy', error: err.message });
    }
  }
  return res.status(200).json({ status: 'fallback_active', latencyMs: 0 });
});

// GET /api/health/ai
router.get('/ai', async (req, res) => {
  const start = Date.now();
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ status: 'unconfigured', error: 'Missing GEMINI_API_KEY env' });
  }
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // Check models list or simple lightweight call to verify key
    await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'ping'
    });
    return res.status(200).json({ status: 'healthy', latencyMs: Date.now() - start });
  } catch (err) {
    return res.status(200).json({ status: 'configured_not_pinged', error: err.message });
  }
});

module.exports = router;
