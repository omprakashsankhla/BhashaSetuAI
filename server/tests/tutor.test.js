const request = require('supertest');
const app = require('../index');
const db = require('../db');
const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');

jest.mock('openai');
jest.mock('@google/genai');

let mockUserId = 1;
jest.mock('jsonwebtoken', () => ({
  verify: (token, secret, cb) => cb(null, { user_id: mockUserId })
}));

// Need to mock db for verifyToken and tutor db calls
jest.mock('../db', () => ({
  query: jest.fn()
}));

// We do NOT mock withTimeout here anymore, so the REAL withTimeout is used.

describe('Tutor API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers(); // ensure timers are real by default
    
    // Mock db queries: 
    // 1. languageContext (if it fires)
    // 2. user profile
    // 3. assessment score
    // 4. progress
    db.query.mockImplementation((query) => {
      if (query.includes('interface_language')) {
        return Promise.resolve([[{ interface_language: 'en', learning_language: 'hi' }]]);
      }
      if (query.includes('SELECT name, settings FROM Users')) {
        return Promise.resolve([[{ name: 'John', settings: null }]]);
      }
      if (query.includes('SELECT score FROM Assessments')) {
        return Promise.resolve([[{ score: 85 }]]);
      }
      if (query.includes('FROM Progress')) {
        return Promise.resolve([[{ title: 'Greetings' }]]);
      }
      return Promise.resolve([[]]);
    });
  });

  describe('POST /api/tutor/chat', () => {
    it('should inject interface and learning language into system prompt via languageContext', async () => {
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: 'Hello from Gemini'
      });
      GoogleGenAI.mockImplementation(() => ({
        models: { generateContent: mockGenerateContent }
      }));

      const res = await request(app)
        .post('/api/tutor/chat')
        .set('Authorization', 'Bearer fake-token')
        .send({ message: 'Hi' });
      
      expect(res.statusCode).toEqual(200);
      expect(mockGenerateContent).toHaveBeenCalled();
      const generateArgs = mockGenerateContent.mock.calls[0][0];
      const systemMessage = generateArgs.contents[0].parts[0].text;
      
      // Using the exact property names set by languageContext middleware: 
      // req.interfaceLanguage and req.learningLanguage
      expect(systemMessage).toContain('Interface Language = en');
      expect(systemMessage).toContain('Learning Language = hi');
    });

    it('should fall back to OpenAI if Gemini primary call fails', async () => {
      const mockGenerateContent = jest.fn().mockRejectedValue(new Error('Gemini Down'));
      GoogleGenAI.mockImplementation(() => ({
        models: { generateContent: mockGenerateContent }
      }));

      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'OpenAI fallback response' } }]
      });
      OpenAI.mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      const res = await request(app)
        .post('/api/tutor/chat')
        .set('Authorization', 'Bearer fake-token')
        .send({ message: 'Hi' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.reply).toEqual('OpenAI fallback response');
      expect(mockGenerateContent).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should trigger fallback if primary call times out using real withTimeout', async () => {
      // Use fake timers to fast-forward past 15000ms safely, as we will bypass Supertest's sockets
      jest.useFakeTimers();

      const mockGenerateContent = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
      GoogleGenAI.mockImplementation(() => ({
        models: { generateContent: mockGenerateContent }
      }));

      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'OpenAI fallback from timeout' } }]
      });
      OpenAI.mockImplementation(() => ({
        chat: { completions: { create: mockCreate } }
      }));

      // Bypassing Supertest to avoid Node HTTP socket deadlocks with fake timers
      const tutorRouter = require('../routes/tutor');
      const chatRoute = tutorRouter.stack.find(layer => layer.route && layer.route.path === '/chat');
      // The last middleware in the route stack is our main controller
      const chatHandler = chatRoute.route.stack[chatRoute.route.stack.length - 1].handle;

      const req = {
        body: { message: 'Hi' },
        interfaceLanguage: 'en',
        learningLanguage: 'hi',
        userId: 1
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Start the handler. It will block inside withTimeout waiting for the AI promise.
      const handlerPromise = chatHandler(req, res);

      // Flush microtasks until the db.query awaits finish and the AI call is reached
      let ticks = 0;
      while(mockGenerateContent.mock.calls.length === 0 && ticks < 50) {
        await Promise.resolve();
        ticks++;
      }

      // Fast-forward 16 seconds to trigger withTimeout's timeout logic
      jest.advanceTimersByTime(16000);
      
      // Wait for the handler to finish processing the catch block
      await handlerPromise;
      
      // Restore real timers
      jest.useRealTimers();

      expect(res.json).toHaveBeenCalledWith({ reply: 'OpenAI fallback from timeout' });
      expect(mockGenerateContent).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should enforce rate limiting at 15 requests per minute', async () => {
      mockUserId = 3; // Use a completely fresh user to avoid hitting limits from previous tests

      GoogleGenAI.mockImplementation(() => ({
        models: { generateContent: jest.fn().mockResolvedValue({ text: 'ok' }) }
      }));

      OpenAI.mockImplementation(() => ({
        chat: { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'ok' } }] }) } }
      }));

      let statusCodes = [];
      for(let i=0; i < 16; i++) {
        const res = await request(app)
          .post('/api/tutor/chat')
          .set('Authorization', 'Bearer rl-token') // different token so it doesn't collide with other tests
          .set('X-Forwarded-For', '127.0.0.10') // ensure distinct IP fallback
          .send({ message: 'Hi' });
        statusCodes.push(res.statusCode);
      }

      // First 15 should be 200, 16th should be 429
      expect(statusCodes[14]).toEqual(200);
      expect(statusCodes[15]).toEqual(429);
    }, 20000);
  });
});
