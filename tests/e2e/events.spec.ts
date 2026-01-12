import { test, expect } from '@playwright/test';

test.describe('Events', () => {
  test('should display events listing page', async ({ page }) => {
    await page.goto('/events');
    
    await expect(page.locator('h1')).toContainText('All Events');
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('should display event filters', async ({ page }) => {
    await page.goto('/events');
    
    await expect(page.locator('input[type="date"]')).toHaveCount(2); // from and to dates
  });

  test('should navigate to event creation (requires auth)', async ({ page }) => {
    await page.goto('/events/create');
    
    // Should redirect to sign in if not authenticated
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should navigate to communities page', async ({ page }) => {
    await page.goto('/communities');
    
    await expect(page.locator('h1')).toContainText('Explore Communities');
    await expect(page.locator('text=Filters')).toBeVisible();
  });
});

test.describe('Static Pages', () => {
  test('should display about page', async ({ page }) => {
    await page.goto('/about');
    
    await expect(page.locator('h1')).toContainText('About +Philia Hub');
    await expect(page.locator('text=Our Mission')).toBeVisible();
  });

  test('should display terms page', async ({ page }) => {
    await page.goto('/terms');
    
    await expect(page.locator('h1')).toContainText('Terms of Service');
  });

  test('should display privacy page', async ({ page }) => {
    await page.goto('/privacy');
    
    await expect(page.locator('h1')).toContainText('Privacy Policy');
  });

  test('should display support page', async ({ page }) => {
    await page.goto('/support');
    
    await expect(page.locator('h1')).toContainText('Support');
    await expect(page.locator('text=FAQ')).toBeVisible();
  });

  test('should display contact page with form', async ({ page }) => {
    await page.goto('/contact');
    
    await expect(page.locator('h1')).toContainText('Contact Us');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="subject"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have skip link', async ({ page }) => {
    await page.goto('/');
    
    // Focus the skip link (it's visually hidden until focused)
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('should have proper page titles', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/\+Philia Hub/);
    
    await page.goto('/about');
    await expect(page).toHaveTitle(/About/);
    
    await page.goto('/events');
    await expect(page).toHaveTitle(/\+Philia Hub/);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Should have exactly one h1
  });

  test('should support keyboard navigation in header', async ({ page }) => {
    await page.goto('/');
    
    // Tab through navigation
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Logo or first nav item
    
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON']).toContain(focused);
  });
});

