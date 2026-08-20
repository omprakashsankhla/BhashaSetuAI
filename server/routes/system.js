const express = require('express');
const db = require('../db');
const cacheService = require('../services/redisClient');
const { logAuditEvent } = require('../services/auditLogger');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify Admin access
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized!' });
    const [rows] = await db.query('SELECT role FROM Users WHERE user_id = ?', [decoded.user_id]);
    if (rows.length === 0 || rows[0].role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    req.userId = decoded.user_id;
    next();
  });
};

// GET /api/system/status
router.get('/status', verifyAdmin, async (req, res) => {
  try {
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    
    // Log verification action
    await logAuditEvent(req.userId, 'SYSTEM_STATUS_CHECK', null, req.ip);

    return res.status(200).json({
      status: 'OK',
      uptimeSeconds: Math.floor(uptime),
      memoryUsage: {
        rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`
      },
      nodeVersion: process.version
    });
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

// GET /api/system/cache
router.get('/cache', verifyAdmin, async (req, res) => {
  const start = Date.now();
  let redisStatus = 'disconnected';
  let latencyMs = 0;

  if (cacheService.redisClient) {
    try {
      await cacheService.redisClient.ping();
      redisStatus = 'connected';
      latencyMs = Date.now() - start;
    } catch (e) {
      redisStatus = 'failed';
    }
  } else {
    redisStatus = 'in-memory-fallback';
  }

  return res.status(200).json({
    cacheType: cacheService.redisClient ? 'Redis' : 'In-Memory Map',
    redisStatus,
    latencyMs
  });
});

// GET /api/system/queues
router.get('/queues', verifyAdmin, async (req, res) => {
  const redisConnected = !!cacheService.redisClient;
  return res.status(200).json({
    queueProvider: redisConnected ? 'BullMQ' : 'In-Memory setTimeout Fallback',
    status: 'healthy',
    activeJobsCount: 0
  });
});

// GET /api/system/translations
router.get('/translations', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM lesson_translations');
    return res.status(200).json({
      status: 'healthy',
      totalCachedTranslations: rows[0].count
    });
  } catch (err) {
    return res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

const metricsCollector = require('../services/monitoring/metricsCollector');
const errorTracker = require('../services/monitoring/errorTracker');

// GET /api/system/metrics
router.get('/metrics', verifyAdmin, (req, res) => {
  return res.status(200).json(metricsCollector.getMetricsSummary());
});

// GET /api/system/errors
router.get('/errors', verifyAdmin, (req, res) => {
  return res.status(200).json(errorTracker.getErrorsSummary());
});

// POST /api/system/performance
router.post('/performance', verifyAdmin, (req, res) => {
  const { metric, latencyMs } = req.body;
  if (metric && latencyMs !== undefined) {
    metricsCollector.recordLatency(metric, latencyMs);
    return res.status(200).json({ status: 'OK' });
  }
  return res.status(400).json({ error: 'Missing metric or latencyMs' });
});

module.exports = router;
