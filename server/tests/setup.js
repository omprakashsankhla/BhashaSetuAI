// Global test setup - automatically loaded by Jest via setupFilesAfterEnv in package.json
// This file mocks all external services so tests can run without real MySQL, Redis, etc.

// Set required environment variables for CI before any modules are loaded
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'mock_key_for_tests';
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'root';
process.env.DB_NAME = process.env.DB_NAME || 'bhashasetu_test';

// Mock the database module
jest.mock('../db', () => ({
  query: jest.fn(),
  execute: jest.fn(),
  getConnection: jest.fn(),
  verifyDatabase: jest.fn().mockResolvedValue(),
}));

// Also mock with .js extension for consistency
jest.mock('../db.js', () => ({
  query: jest.fn(),
  execute: jest.fn(),
  getConnection: jest.fn(),
  verifyDatabase: jest.fn().mockResolvedValue(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secret, callback) => {
    callback(null, { user_id: 1, email: 'test@test.com' });
  }),
  sign: jest.fn(() => 'fake-token')
}));

// Mock Google GenAI
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: '{"modules": []}'
          })
        }
      };
    })
  };
});

// Mock ioredis so Redis connections aren't attempted on CI
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    call: jest.fn().mockResolvedValue(null),
    disconnect: jest.fn(),
    quit: jest.fn(),
  }));
});

// Mock web-push
jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue({}),
}));

// Mock openai - must export { OpenAI } as a named class since translationHelper.js destructures it
jest.mock('openai', () => {
  const MockOpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: '{}' } }]
        })
      }
    }
  }));
  return { OpenAI: MockOpenAI };
});

// Mock fetch globally
global.fetch = jest.fn();
