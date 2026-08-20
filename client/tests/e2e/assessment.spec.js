import { test, expect } from '@playwright/test';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Content-Type': 'application/json'
};

test.describe('Assessment E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add browser console and error logs debugging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', exception => {
      console.log(`BROWSER EXCEPTION: ${exception.message}`);
    });

    // Intercept CORS preflight OPTIONS requests
    await page.route('**/*', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: corsHeaders
        });
      } else {
        await route.continue();
      }
    });

    // Intercept assessment generate request
    await page.route(/\/api\/assessment\/generate/, async (route) => {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          questions: [
            { id: 1, question_id: 1, type: 'MCQ', text: 'Choose the word for "Water"', options: ['पानी', 'हवा'], answer: 'पानी', feedback: 'Correct!' }
          ]
        })
      });
    });

    // Intercept assessment submit request
    await page.route(/\/api\/assessment\/submit/, async (route) => {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          insights: {
            overall_level: 'Beginner',
            strengths: ['Vocabulary'],
            weaknesses: ['Speaking'],
            learning_strategy: 'Practice daily speaking tasks.',
            recommended_focus: 'speaking',
          },
          evaluation: 'Practice daily speaking tasks.',
          curriculum: []
        })
      });
    });

    // Go to Auth and inject token
    await page.goto('/register');
    await page.evaluate(() => {
      localStorage.clear(); // Ensure clean storage state
      localStorage.setItem('token', 'mock_e2e_token');
      localStorage.setItem('user', JSON.stringify({
        user_id: 9999,
        name: 'Tester E2E',
        email: 'e2e@example.com',
        preferred_language: 'en',
        learning_language: 'hi'
      }));
    });
  });

  test('should go through language selection and initial assessment', async ({ page }) => {
    // Go to assessment page directly with authenticated local storage
    await page.goto('/assessment');
    
    // Confirm assessment page URL
    await expect(page).toHaveURL(/\/assessment/);
    console.log("INITIAL URL:", page.url());

    // Wait for the mock question option button to render
    const optionBtn = page.locator('button:has-text("पानी")');
    await expect(optionBtn).toBeVisible();
    await optionBtn.click();
    console.log("CLICKED OPTION");

    // Click check
    const checkBtn = page.locator('.action-area button.check-btn');
    await expect(checkBtn).toBeVisible();
    await checkBtn.click();
    console.log("CLICKED CHECK. CURRENT URL:", page.url());

    // Wait short time to allow re-render
    await page.waitForTimeout(500);

    // Click next / complete
    const nextBtn = page.locator('.action-area button.next-btn');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    console.log("CLICKED NEXT. CURRENT URL:", page.url());
  });
});
