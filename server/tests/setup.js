jest.mock('../db.js', () => ({
  query: jest.fn(),
  execute: jest.fn(),
  getConnection: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token, secret, callback) => {
    callback(null, { user_id: 1, email: 'test@test.com' });
  }),
  sign: jest.fn(() => 'fake-token')
}));

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

// Since the server might be using @google/genai directly or some other package... let me mock fetch just in case.
global.fetch = jest.fn();
