const request = require('supertest');
const app = require('../index');
const db = require('../db');

describe('Assessment API Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/assessment/generate', () => {
    it('should return a list of questions based on demographic', async () => {
      // Mock db.query for fetching user's demographic
      db.query.mockResolvedValueOnce([
        [
          { age: 25, education_level: 'College/University', preferred_language: 'en' }
        ]
      ]);

      const res = await request(app).get('/api/assessment/generate?lang=en&level=Beginner')
        .set('Authorization', 'Bearer fake-token');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.questions)).toBeTruthy();
      expect(res.body.questions.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/assessment/submit', () => {
    it('should process answers, return results, and generate curriculum', async () => {
      // Mock db.query with a function to handle different queries
      db.query.mockImplementation((query) => {
        if (query.includes('SELECT age')) {
          return Promise.resolve([[ { age: 25, education_level: 'College/University' } ]]);
        }
        return Promise.resolve([{ insertId: 1 }]);
      });

      const res = await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', 'Bearer fake-token')
        .send({
          results: [
            { isCorrect: true, type: 'grammar', timeTaken: 5000 },
            { isCorrect: false, type: 'vocabulary', timeTaken: 10000 }
          ],
          lang: 'en',
          level: 'Beginner'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Assessment and curriculum saved successfully');
      expect(res.body).toHaveProperty('totalScore');
      expect(res.body).toHaveProperty('insights');
      expect(res.body.totalScore).toEqual(10); // 1 correct answer * 10
    });
  });
});
