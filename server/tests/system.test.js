const db = require('../db');
const request = require('supertest');
const express = require('express');
const systemRouter = require('../routes/system');

describe('System Production Validation endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use('/api/system', systemRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/system/status should return system info for admin role', async () => {
    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); // verifyAdmin check
    db.query.mockResolvedValueOnce([]); // Mock logAuditEvent query

    const response = await request(app)
      .get('/api/system/status')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.uptimeSeconds).toBeDefined();
    expect(response.body.memoryUsage).toBeDefined();
  });

  test('GET /api/system/cache should return cache connectivity status', async () => {
    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); // verifyAdmin check

    const response = await request(app)
      .get('/api/system/cache')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.cacheType).toBeDefined();
    expect(response.body.redisStatus).toBeDefined();
  });

  test('GET /api/system/translations should return cached translations count', async () => {
    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); // verifyAdmin check
    db.query.mockResolvedValueOnce([[{ count: 42 }]]); // SELECT COUNT count

    const response = await request(app)
      .get('/api/system/translations')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.totalCachedTranslations).toBe(42);
  });
});
