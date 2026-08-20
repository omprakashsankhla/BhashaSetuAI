import { test, expect } from '@playwright/test';

const mockDashboardData = {
  user: { name: 'Tester E2E', proficiency_level: 'Beginner' },
  stats: { streak: 3, coins: 50, xp: 100, hearts: 5 },
  lessons: [{ id: 1, title: 'Greetings Lesson', level: 'Beginner', type: 'reading', status: 'active' }],
  currentLesson: { id: 1, title: 'Greetings Lesson', level: 'Beginner', type: 'reading', status: 'active' },
  todaysGoal: { earned: 20, target: 60 },
  dayNumber: 2,
  unitProgress: {
    Beginner: [
      { name: 'Unit 1', status: 'current', completedLessons: 0, totalLessons: 1, lessons: [{ id: 1, title: 'Greetings Lesson', status: 'active' }] }
    ]
  },
  achievements: [],
  rank: 'Bronze',
  leaderboard: [],
  skillAnalysis: { reading: 80, writing: 70, speaking: 90, listening: 85, vocabulary: 75, grammar: 80 },
  todaysTasks: { lessonCompleted: false, gameCompleted: false, speakingDone: false, activityCompleted: false },
  assignedTasks: [],
  announcements: [],
  settings: { theme: 'light', notifications_enabled: true }
};

test.describe('Lesson E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Inject local storage credentials
    await page.goto('/register');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock_e2e_token');
      localStorage.setItem('user', JSON.stringify({
        user_id: 9999,
        name: 'Tester E2E',
        email: 'e2e@example.com',
        preferred_language: 'en',
        learning_language: 'hi'
      }));
    });

    // Mock API requests
    await page.route(/\/api\/learning\/1/, async (route) => {
      if (route.request().url().includes('complete')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, xpEarned: 20, coinsEarned: 10 })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            lesson: { lesson_id: 1, title: 'Greetings Lesson', level: 'Beginner' },
            activities: [
              { type: 'MCQ', text: 'Translate "Hello"', options: ['नमस्ते', 'अलविदा'], answer: 'नमस्ते' }
            ]
          })
        });
      }
    });

    await page.route(/\/api\/dashboard\/data/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDashboardData)
      });
    });

    await page.route(/\/api\/learning\/progress\/skill/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
  });

  test('should load a lesson and complete it successfully', async ({ page }) => {
    // Visit lesson page
    await page.goto('/lesson/1');

    // Verify Title or text of the first activity
    const activityText = page.locator('h2:has-text("Translate \\"Hello\\"")');
    await expect(activityText).toBeVisible();

    // Select Answer
    const correctOption = page.locator('button:has-text("नमस्ते")');
    await expect(correctOption).toBeVisible();
    await correctOption.click();

    // Check answer
    await page.click('button.primary-btn');

    // Click Finish Lesson
    await page.click('button.primary-btn');

    // Verify completion screen
    const completeHeader = page.locator('h1:has-text("Lesson Completed!")');
    await expect(completeHeader).toBeVisible();
  });
});
