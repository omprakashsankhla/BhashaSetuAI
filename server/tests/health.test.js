const db = require('../db');
const cacheService = require('../services/redisClient');
const request = require('supertest');
const express = require('express');
const healthRouter = require('../routes/health');

describe('Health and Latency Monitoring Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use('/api/health', healthRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/health should aggregate DB and cache health status', async () => {
    db.query.mockResolvedValueOnce([]); // Mock DB select 1
    // Simulate active redis client with healthy ping
    cacheService.redisClient = {
      ping: jest.fn().mockResolvedValue('PONG')
    };

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.checks.db).toBe('healthy');
    expect(response.body.checks.redis).toBe('healthy');
  });

  test('GET /api/health/db should return healthy DB ping duration', async () => {
    db.query.mockResolvedValueOnce([]); // Mock DB select 1

    const response = await request(app).get('/api/health/db');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.latencyMs).toBeGreaterThanOrEqual(0);
  });

  test('GET /api/health/redis should return healthy redis ping duration', async () => {
    cacheService.redisClient = {
      ping: jest.fn().mockResolvedValue('PONG')
    };

    const response = await request(app).get('/api/health/redis');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
