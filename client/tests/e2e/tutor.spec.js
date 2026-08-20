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

test.describe('AI Tutor E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Inject credentials
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

    // Mock API requests called during Dashboard load
    await page.route(/\/api\/dashboard\/data/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDashboardData)
      });
    });

    await page.route(/\/api\/dashboard\/ai-insight/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          insight: 'Mocked insight text'
        })
      });
    });

    await page.route(/\/api\/announcements/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
  });

  test('should open tutor chat and submit a textual doubt query', async ({ page }) => {
    // Intercept chat API
    await page.route(/\/api\/tutor\/chat/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: 'Namaste! Main aapki kaise madad kar sakta hoon?'
        })
      });
    });

    // Go to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Click on tutor FAB
    const tutorFab = page.locator('.ai-tutor-fab');
    await expect(tutorFab).toBeVisible();
    await tutorFab.click();

    // Confirm modal loaded
    const modalHeader = page.locator('.tutor-header');
    await expect(modalHeader).toBeVisible();

    // Type query
    await page.fill('textarea', 'How to say welcome in Hindi?');
    await page.click('button.send-btn');
  });
});
