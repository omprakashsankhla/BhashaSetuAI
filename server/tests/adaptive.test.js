const { calculateSM2 } = require('../services/reviewScheduler');
const { recordAttempt, scheduleReview, getAdaptiveRecommendations } = require('../services/adaptiveLearningService');
const db = require('../db');
const request = require('supertest');
const express = require('express');
const adaptiveRouter = require('../routes/adaptive');

describe('Adaptive Learning SM-2 Scheduling Algorithm', () => {
  test('should return interval of 1 day for quality < 3', () => {
    const res = calculateSM2(2, 2, 6, 2.5);
    expect(res.repetitions).toBe(0);
    expect(res.intervalDays).toBe(1);
  });

  test('should return interval of 1 day for quality >= 3, reps = 0', () => {
    const res = calculateSM2(4, 0, 0, 2.5);
    expect(res.repetitions).toBe(1);
    expect(res.intervalDays).toBe(1);
  });

  test('should return interval of 6 days for quality >= 3, reps = 1', () => {
    const res = calculateSM2(4, 1, 1, 2.5);
    expect(res.repetitions).toBe(2);
    expect(res.intervalDays).toBe(6);
  });

  test('should multiply interval by ease factor for quality >= 3, reps > 1', () => {
    const res = calculateSM2(4, 2, 6, 2.5);
    expect(res.repetitions).toBe(3);
    expect(res.intervalDays).toBe(15); // 6 * 2.5
  });
});

describe('Adaptive Learning Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('recordAttempt should insert new skill analytics if none exists', async () => {
    db.query.mockResolvedValueOnce([[]]); // No existing analytics
    db.query.mockResolvedValueOnce([]); // Insert analytics query

    await recordAttempt(1, 'reading', true);

    expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT'), [1, 'reading']);
    expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO Skill_Analytics'), [1, 'reading', 1, 100]);
  });

  test('recordAttempt should update skill analytics if exists', async () => {
    db.query.mockResolvedValueOnce([[{ total_attempts: 4, correct_attempts: 2 }]]);
    db.query.mockResolvedValueOnce([]); // Update query

    await recordAttempt(1, 'reading', true);

    expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('UPDATE Skill_Analytics'), [5, 3, 60, 1, 'reading']);
  });

  test('recordAttempt should insert weak area if attempt is incorrect', async () => {
    db.query.mockResolvedValueOnce([[]]); // Analytics SELECT
    db.query.mockResolvedValueOnce([]); // Analytics INSERT
    db.query.mockResolvedValueOnce([[]]); // Weak Area SELECT
    db.query.mockResolvedValueOnce([]); // Weak Area INSERT

    await recordAttempt(1, 'reading', false, 'pronunciation');

    expect(db.query).toHaveBeenNthCalledWith(3, expect.stringContaining('SELECT fail_count'), [1, 'reading', 'pronunciation']);
    expect(db.query).toHaveBeenNthCalledWith(4, expect.stringContaining('INSERT INTO Weak_Areas'), [1, 'reading', 'pronunciation']);
  });

  test('scheduleReview should fetch previous state and upsert review schedule', async () => {
    db.query.mockResolvedValueOnce([[{ repetitions: 2, interval_days: 6, ease_factor: 2.5 }]]); // Queue SELECT
    db.query.mockResolvedValueOnce([]); // Queue UPSERT

    await scheduleReview(1, 'Vocabulary', 101, 4);

    expect(db.query).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT'), [1, 'Vocabulary', 101]);
    expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO Review_Queue'), [
      1, 'Vocabulary', 101, expect.any(String), 3, 15, expect.any(Number)
    ]);
  });
});

describe('Adaptive Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/adaptive', adaptiveRouter);
  });

  test('POST /api/adaptive/schedule-review should save review item successfully', async () => {
    db.query.mockResolvedValueOnce([[]]); // Queue SELECT
    db.query.mockResolvedValueOnce([]); // Queue UPSERT

    const response = await request(app)
      .post('/api/adaptive/schedule-review')
      .set('Authorization', 'Bearer fake-token')
      .send({
        itemType: 'Vocabulary',
        itemId: 101,
        rating: 4
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Item scheduled for review successfully');
  });

  test('GET /api/adaptive/recommendations should fetch recommendations', async () => {
    db.query.mockResolvedValueOnce([[{ skill_type: 'vocabulary', correct_count: 5, total_count: 10 }]]); // User_Skills
    db.query.mockResolvedValueOnce([[{ skill: 'vocabulary', fail_count: 1 }]]); // Weak_Areas
    db.query.mockResolvedValueOnce([[{ current_streak: 2, last_active: '2026-08-14' }]]); // User_Analytics
    db.query.mockResolvedValueOnce([[{ lesson_id: 1, title: 'Basics', level: 'Beginner', status: 'In Progress' }]]); // Progress

    const response = await request(app)
      .get('/api/adaptive/recommendations')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.skillVectors).toBeDefined();
    expect(response.body.engagement).toBeDefined();
    expect(response.body.learningPath).toBeDefined();
    expect(response.body.recommendations).toBeDefined();
  });
});
