const request = require('supertest');
const app = require('../index');
const db = require('../db');
const translationHelper = require('../routes/translationHelper');

// Mock translation helper so we can verify if AI is called
jest.spyOn(translationHelper, 'translateOrAdaptContent');

describe('BhashaSetu E2E Integration Flow', () => {
  let token = '';
  const mockDbState = {
    users: [],
    progress: [],
    lessons: [
      { lesson_id: 1, title: 'Letters', level: 'Beginner', content_data: JSON.stringify({ type: 'reading' }) }
    ],
    translations: [
      {
        lesson_id: 1,
        language_code: 'te',
        interface_language: 'en',
        translated_content: JSON.stringify({
          title: 'అక్షరాలు',
          level: 'Beginner',
          activities: [
            { type: 'MCQ', text: 'Which letter comes first in the English alphabet?', options: ['A', 'B'], answer: 'A' }
          ]
        })
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clean mock DB state
    mockDbState.users = [];
    mockDbState.progress = [];

    // Mock query logic to simulate real database response mappings
    db.query.mockImplementation(async (sql, params) => {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();

      // Users SELECT
      if (normalizedSql.includes('SELECT * FROM Users WHERE email = ?')) {
        const found = mockDbState.users.filter(u => u.email === params[0]);
        return [found];
      }
      if (normalizedSql.includes('SELECT name, preferred_language')) {
        const found = mockDbState.users.filter(u => u.user_id === params[0]);
        return [found];
      }

      // Users INSERT
      if (normalizedSql.includes('INSERT INTO Users')) {
        const newId = mockDbState.users.length + 1;
        const newUser = {
          user_id: newId,
          name: params[0],
          email: params[1],
          password_hash: params[2],
          interface_language: params[6] || 'en',
          learning_language: params[7] || 'hi',
          role: 'Student',
          xp: 0,
          coins: 0,
          streak: 1
        };
        mockDbState.users.push(newUser);
        return [{ insertId: newId }];
      }

      // Users UPDATE
      if (normalizedSql.includes('UPDATE Users SET streak')) {
        return [{}];
      }
      if (normalizedSql.includes('UPDATE Users SET coins')) {
        const user = mockDbState.users.find(u => u.user_id === params[1]);
        if (user) user.coins += params[0];
        return [{}];
      }

      // Lessons INSERT
      if (normalizedSql.includes('INSERT INTO Lessons')) {
        const newId = mockDbState.lessons.length + 1;
        const newLesson = {
          lesson_id: newId,
          title: params[0],
          level: params[1],
          content_data: params[2]
        };
        mockDbState.lessons.push(newLesson);
        return [{ insertId: newId }];
      }

      // Assessments INSERT
      if (normalizedSql.includes('INSERT INTO Assessments')) {
        return [{ insertId: 1 }];
      }

      // Progress DELETE
      if (normalizedSql.includes('DELETE FROM Progress WHERE user_id = ?')) {
        mockDbState.progress = mockDbState.progress.filter(p => p.user_id !== params[0]);
        return [{}];
      }

      // Lessons SELECT
      if (normalizedSql.includes('SELECT lesson_id FROM Lessons WHERE title = ?')) {
        const found = mockDbState.lessons.filter(l => l.title === params[0] && l.level === params[1]);
        return [found];
      }
      if (normalizedSql.includes('SELECT level, title FROM Lessons WHERE lesson_id = ?')) {
        const found = mockDbState.lessons.filter(l => l.lesson_id == params[0]);
        return [found];
      }

      // Progress SELECT (Complete page / sequential checks)
      if (normalizedSql.includes('SELECT lesson_id, status FROM Progress WHERE user_id = ?')) {
        const found = mockDbState.progress.filter(p => p.user_id == params[0]);
        return [found];
      }

      // Progress INSERT
      if (normalizedSql.includes('INSERT INTO Progress')) {
        const newProg = {
          progress_id: mockDbState.progress.length + 1,
          user_id: params[0],
          lesson_id: params[1],
          status: params[2],
          completed_at: params[3]
        };
        mockDbState.progress.push(newProg);
        return [{ insertId: newProg.progress_id }];
      }

      // Progress SELECT
      if (normalizedSql.includes('SELECT p.lesson_id as id')) {
        const joined = mockDbState.progress
          .filter(p => p.user_id === params[0])
          .map(p => {
            const lesson = mockDbState.lessons.find(l => l.lesson_id === p.lesson_id) || {};
            return {
              id: p.lesson_id,
              title: lesson.title,
              level: lesson.level,
              type: 'speaking',
              status: p.status,
              completed_at: p.completed_at,
              progress_id: p.progress_id
            };
          });
        return [joined];
      }

      // Translations SELECT
      if (normalizedSql.includes('SELECT translated_content FROM lesson_translations')) {
        const found = mockDbState.translations.filter(t => t.lesson_id == params[0] && t.language_code === params[1] && t.interface_language === params[2]);
        return [found];
      }

      // Default mock query response
      return [[{}]];
    });
  });

  it('should run registration, login, selections, initial assessment, submit assessment, load lesson, and complete lesson', async () => {
    // 1. REGISTER
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Integration Learner',
        email: 'integration@learner.com',
        password: 'securepassword123',
        learning_language: 'te',
        interface_language: 'en'
      });

    expect(regRes.statusCode).toEqual(201);
    expect(regRes.body).toHaveProperty('token');
    token = regRes.body.token;

    // 2. LOGIN
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'integration@learner.com',
        password: 'securepassword123'
      });

    expect(loginRes.statusCode).toEqual(200);
    expect(loginRes.body.user.learning_language).toEqual('te');
    expect(loginRes.body.user.interface_language).toEqual('en');

    // 3. INITIAL ASSESSMENT
    const generateRes = await request(app)
      .get('/api/assessment/generate?lang=te&level=Beginner')
      .set('Authorization', `Bearer ${token}`);

    expect(generateRes.statusCode).toEqual(200);
    expect(generateRes.body.questions).toBeDefined();

    // 4. SUBMIT ASSESSMENT
    const submitRes = await request(app)
      .post('/api/assessment/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        results: [
          { isCorrect: true, type: 'grammar' },
          { isCorrect: true, type: 'vocabulary' }
        ],
        lang: 'te',
        interfaceLang: 'en',
        level: 'Beginner'
      });

    expect(submitRes.statusCode).toEqual(200);
    expect(submitRes.body.curriculum).toBeDefined();

    // 5. LOAD DYNAMIC LESSON
    // Teflon-translated lesson (lesson 1, Telugu, English interface) already in mock cache
    const lessonRes = await request(app)
      .get('/api/learning/1?lang=te&interfaceLang=en')
      .set('Authorization', `Bearer ${token}`);

    expect(lessonRes.statusCode).toEqual(200);
    expect(lessonRes.body.activities).toBeDefined();

    // MOST IMPORTANT CHECK: Since the Telugu translation was already cached in lesson_translations, 
    // it must NOT invoke the AI translateOrAdaptContent function.
    expect(translationHelper.translateOrAdaptContent).not.toHaveBeenCalled();

    // 6. COMPLETE LESSON
    const completeRes = await request(app)
      .post('/api/learning/1/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({
        xpEarned: 25,
        coinsEarned: 15
      });

    expect(completeRes.statusCode).toEqual(200);
    expect(completeRes.body.message).toContain('completed successfully');
  });
});
