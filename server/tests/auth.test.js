const request = require('supertest');
const app = require('../index');
const db = require('../db');
const bcrypt = require('bcrypt');

describe('Auth API Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      db.query.mockResolvedValueOnce([[]]); 
      db.query.mockResolvedValueOnce([{ insertId: 1 }]); 
      db.query.mockResolvedValueOnce([[{ id: 1, email: 'test@test.com', name: 'Test', role: 'Student' }]]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@test.com',
          password: 'password123',
          preferred_language: 'en'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@test.com');
    });

    it('should return 400 if user already exists', async () => {
      db.query.mockResolvedValueOnce([[{ id: 1, email: 'test@test.com' }]]); 

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@test.com',
          password: 'password123',
          preferred_language: 'en'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      db.query.mockResolvedValueOnce([[{ 
        user_id: 1, 
        email: 'test@test.com', 
        password_hash: hashedPassword,
        name: 'Test',
        role: 'Student'
      }]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});
