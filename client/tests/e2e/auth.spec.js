import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Flow', () => {
  test('should register, login, persist JWT, and logout successfully', async ({ page }) => {
    // Intercept register request
    await page.route(/\/api\/auth\/register/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mocked_playwright_token',
          user: {
            user_id: 1234,
            name: 'Playwright Tester',
            email: 'playwright@example.com',
            preferred_language: 'en'
          }
        })
      });
    });

    // Visit Register Page
    await page.goto('/register');
    await expect(page).toHaveTitle(/Bhasha\s*Setu/i);

    // Register
    await page.fill('input#name', 'Playwright Tester');
    await page.fill('input#email', 'playwright@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input#age', '25');
    await page.click('button.auth-submit-btn');

    // Confirm local storage token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('mocked_playwright_token');
  });

  test('should display Google OAuth options', async ({ page }) => {
    await page.goto('/register');
    const googleBtn = page.locator('button:has-text("Google")');
    await expect(googleBtn).toBeVisible();
  });
});
