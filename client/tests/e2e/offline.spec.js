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

test.describe('PWA Offline & Reconnect Sync Flow', () => {
  test.beforeEach(async ({ page }) => {
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

    await page.route(/\/api\/dashboard\/data/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDashboardData)
      });
    });
  });

  test('should detect changes in connectivity state', async ({ page, context }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify online in window state
    let isOnline = await page.evaluate(() => navigator.onLine);
    expect(isOnline).toBe(true);

    // Emulate offline state
    await context.setOffline(true);

    // Verify offline state detects correctly
    isOnline = await page.evaluate(() => navigator.onLine);
    expect(isOnline).toBe(false);

    // Reconnect
    await context.setOffline(false);
  });
});
