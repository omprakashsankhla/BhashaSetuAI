import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const mockDashboardData = {
  user: { name: 'A11y Tester', proficiency_level: 'Beginner' },
  stats: { streak: 5, coins: 120, xp: 240, hearts: 5 },
  lessons: [{ id: 1, title: 'Basics Unit', level: 'Beginner', type: 'vocabulary', status: 'active' }],
  currentLesson: { id: 1, title: 'Basics Unit', level: 'Beginner', type: 'vocabulary', status: 'active' },
  todaysGoal: { earned: 10, target: 50 },
  dayNumber: 3,
  unitProgress: {
    Beginner: [
      { name: 'Unit 1', status: 'current', completedLessons: 0, totalLessons: 1, lessons: [{ id: 1, title: 'Basics Unit', status: 'active' }] }
    ]
  },
  achievements: [],
  rank: 'Bronze',
  leaderboard: [],
  skillAnalysis: { reading: 85, writing: 80, speaking: 75, listening: 90, vocabulary: 80, grammar: 85 },
  todaysTasks: { lessonCompleted: false, gameCompleted: false, speakingDone: false, activityCompleted: false },
  assignedTasks: [],
  announcements: [],
  settings: { theme: 'dark', notifications_enabled: true }
};

test.describe('Dashboard Accessibility AA checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock_a11y_token');
      localStorage.setItem('user', JSON.stringify({
        user_id: 123,
        name: 'A11y Tester',
        email: 'a11y@example.com',
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

  test('dashboard page should have no accessibility violations', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
