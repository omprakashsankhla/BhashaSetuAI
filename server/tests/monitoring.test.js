const request = require('supertest');
const express = require('express');
const systemRouter = require('../routes/system');
const db = require('../db');

describe('System Monitoring Telemetry endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/system', systemRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/system/metrics should return latency summary averages', async () => {
    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); // Admin check

    const response = await request(app)
      .get('/api/system/metrics')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.averages).toBeDefined();
  });

  test('GET /api/system/errors should return captured exceptions log', async () => {
    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); // Admin check

    const response = await request(app)
      .get('/api/system/errors')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.totalRecordedErrors).toBeDefined();
  });

  test('POST /api/system/performance should record telemetry data', async () => {
    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); // Admin check

    const response = await request(app)
      .post('/api/system/performance')
      .set('Authorization', 'Bearer fake-token')
      .send({ metric: 'client_load_time', latencyMs: 350 });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});
