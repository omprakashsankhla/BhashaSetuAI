import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Assessment Accessibility AA checks', () => {
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

    await page.route(/\/api\/assessment\/generate/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          questions: [
            { id: 1, type: 'MCQ', text: 'Choose hello', options: ['A', 'B'], answer: 'A' }
          ]
        })
      });
    });
  });

  test('assessment page should have no accessibility violations', async ({ page }) => {
    await page.goto('/assessment');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
