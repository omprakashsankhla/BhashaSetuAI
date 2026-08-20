const db = require('../db');
const request = require('supertest');
const express = require('express');
const analyticsRouter = require('../routes/analytics');

describe('Analytics and Reporting Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/analytics', analyticsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/analytics/dashboard should aggregate stats correctly', async () => {
    // 1. mock verifyAdmin User check
    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); // verifyAdmin check

    // 2. mock dashboard aggregates
    db.query.mockResolvedValueOnce([[{ total_users: 10 }]]); // total users
    db.query.mockResolvedValueOnce([[{ mau: 8 }]]); // MAU
    db.query.mockResolvedValueOnce([[{ wau: 5 }]]); // WAU
    db.query.mockResolvedValueOnce([[{ dau: 2 }]]); // DAU
    db.query.mockResolvedValueOnce([[{ learning_language: 'hi', count: 7 }, { learning_language: 'en', count: 3 }]]); // language dist
    db.query.mockResolvedValueOnce([[{ status: 'Completed', count: 12 }, { status: 'In Progress', count: 4 }]]); // lesson stats
    db.query.mockResolvedValueOnce([[{ date: '2026-08-10', completions: 3 }]]); // activity trend

    const response = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.metrics.total_users).toBe(10);
    expect(response.body.metrics.mau).toBe(8);
    expect(response.body.metrics.wau).toBe(5);
    expect(response.body.metrics.dau).toBe(2);
    expect(response.body.languageDistribution).toHaveLength(2);
    expect(response.body.lessonStatus).toHaveLength(2);
    expect(response.body.activityTrend).toHaveLength(1);
  });

  test('GET /api/analytics/export should compile and download CSV', async () => {
    // 1. mock verifyAdmin check
    db.query.mockResolvedValueOnce([[{ role: 'Admin' }]]); 

    // 2. mock student lists joining Progress & Assessments
    db.query.mockResolvedValueOnce([[
      { user_id: 1, name: 'Alice', email: 'alice@test.com', role: 'Student', learning_language: 'hi', preferred_language: 'en', proficiency_level: 'Beginner', xp: 120, coins: 50, completed_lessons: 4, assessments_count: 2, average_assessment_score: 85.5 }
    ]]);

    const response = await request(app)
      .get('/api/analytics/export')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toContain('text/csv');
    expect(response.header['content-disposition']).toContain('attachment; filename=student_analytics.csv');
    
    const lines = response.text.split('\n');
    expect(lines[0]).toContain('User ID,Name,Email,Role,Learning Language,Interface Language,Level,XP,Coins,Lessons Completed,Assessments Attempted,Avg Assessment Score');
    expect(lines[1]).toContain('1,"Alice","alice@test.com",Student,hi,en,Beginner,120,50,4,2,85.50');
  });

  test('GET /api/analytics/dashboard should reject non-admins', async () => {
    // mock verifyAdmin checking role and finding Student
    db.query.mockResolvedValueOnce([[{ role: 'Student' }]]);

    const response = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Admin access required.');
  });
});
