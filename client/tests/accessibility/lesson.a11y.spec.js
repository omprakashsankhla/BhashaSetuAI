import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Lessons Accessibility AA checks', () => {
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

    await page.route(/\/api\/learning\/1/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          lesson_id: 1,
          title: 'Greetings Lesson',
          level: 'Beginner',
          content_data: {
            steps: [{ type: 'text', title: 'Say Hello', instruction: 'Read aloud: Hello' }]
          }
        })
      });
    });
  });

  test('lesson page should have no accessibility violations', async ({ page }) => {
    await page.goto('/lessons/1');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
