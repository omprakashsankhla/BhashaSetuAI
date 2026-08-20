const request = require('supertest');
const app = require('../index');
const db = require('../db');
const { GoogleGenAI } = require('@google/genai');

jest.mock('jsonwebtoken', () => ({
  verify: (token, secret, cb) => cb(null, { user_id: 2 })
}));

jest.mock('@google/genai', () => {
  const sharedMock = jest.fn().mockResolvedValue({ text: '{}' });
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: sharedMock
      }
    }))
  };
});

jest.mock('../utils/withTimeout', () => ({
  withTimeout: (promise) => promise
}));

describe('Assessment API Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/assessment/generate', () => {
    it('should return a list of questions based on demographic', async () => {
      // Mock db.query for languageContext first, then demographic
      db.query.mockResolvedValueOnce([
        [{ interface_language: 'en', learning_language: 'en' }]
      ]).mockResolvedValueOnce([
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
        if (query.includes('interface_language')) {
          return Promise.resolve([[{ interface_language: 'en', learning_language: 'en' }]]);
        }
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
          ]
        });

      console.log('POST /submit response:', res.statusCode, Object.keys(res.body));
      expect(res.statusCode).toEqual(200);
      expect(res.body.curriculum).toBeDefined();
    });
  });

  describe('POST /api/assessment/voice', () => {
    it('should evaluate voice response properly', async () => {
      // Mock db queries
      db.query.mockImplementation(() => Promise.resolve([{ insertId: 1 }]));

      const res = await request(app)
        .post('/api/assessment/voice')
        .set('Authorization', 'Bearer fake-token')
        .send({
          expectedText: 'hello',
          browserTranscript: 'hello'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.scores).toBeDefined();
    });

    it('should trigger outer catch branch and retry via fallbackAi text-only when browserTranscript fails without file', async () => {
      // Mock db queries
      db.query.mockImplementation(() => Promise.resolve([{ insertId: 1 }]));

      const generateContentMock = new (require('@google/genai').GoogleGenAI)().models.generateContent;
      // First call (primary STT AI) throws
      generateContentMock.mockRejectedValueOnce(new Error('Primary Gemini down'));
      
      // Second call (fallback Text AI) succeeds
      generateContentMock.mockResolvedValueOnce({
        text: '{"transcription":"test text","pronunciation":90,"fluency":85,"accuracy":80,"confidence":95,"feedback":"Good job!"}'
      });

      const res = await request(app)
        .post('/api/assessment/voice')
        .set('Authorization', 'Bearer fake-token')
        .send({
          expectedText: 'test text',
          browserTranscript: 'test text'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.scores).toHaveProperty('pronunciation', 90);
      
      // We expect generateContent to have been called twice (once primary, once fallback)
      expect(generateContentMock).toHaveBeenCalledTimes(2);
    });

    it('should enforce rate limiting at 6 requests per minute', async () => {
      // Override jwt verify to use a different user_id for this test so rate limiter is fresh
      require('jsonwebtoken').verify = (token, secret, cb) => cb(null, { user_id: 999 });
      
      let statusCodes = [];
      for(let i=0; i < 7; i++) {
        const res = await request(app)
          .post('/api/assessment/voice')
          .set('Authorization', 'Bearer fake-token')
          .send({
            expectedText: 'hello',
            browserTranscript: 'hello'
          });
        statusCodes.push(res.statusCode);
      }

      // First 6 should be 200, 7th should be 429
      expect(statusCodes[5]).toEqual(200);
      expect(statusCodes[6]).toEqual(429);
    });
  });
});
