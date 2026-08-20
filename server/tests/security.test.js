const db = require('../db');
const request = require('supertest');
const express = require('express');
const helmet = require('helmet');
const requestIdMiddleware = require('../middleware/requestIdMiddleware');
const { logAuditEvent } = require('../services/auditLogger');

describe('Security Headers and Request ID Middleware', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(requestIdMiddleware);
    app.use(helmet());
    app.get('/test-route', (req, res) => {
      res.status(200).json({ requestId: req.id });
    });
  });

  test('should attach X-Request-ID and helmet CSP headers', async () => {
    const response = await request(app).get('/test-route');
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
  });
});

describe('Audit Logger service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logAuditEvent should write to Audit_Logs DB table', async () => {
    db.query.mockResolvedValueOnce([]); // Mock insert select

    await logAuditEvent(1, 'TEST_AUDIT', { val: 42 }, '127.0.0.1');

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO Audit_Logs'),
      [1, 'TEST_AUDIT', '{"val":42}', '127.0.0.1']
    );
  });
});
