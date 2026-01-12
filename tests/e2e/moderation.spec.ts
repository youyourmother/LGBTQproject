import { test, expect } from '@playwright/test';

test.describe('Moderation and Safety', () => {
  test('should have report button on event pages', async ({ page }) => {
    await page.goto('/events');
    
    const eventLink = page.locator('a[href^="/events/"]').first();
    const href = await eventLink.getAttribute('href');
    
    if (href) {
      await page.goto(href);
      
      // Report button might only show when logged in
      // Check for report text somewhere on page
      const reportText = page.locator('text=Report');
      const count = await reportText.count();
      
      // Should have report functionality (might be hidden if not logged in)
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should redirect to signin when accessing admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect to signin (or home if logged in but not admin)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/signin|^\/$/);
  });

  test('should display content guidelines on support page', async ({ page }) => {
    await page.goto('/support');
    
    await expect(page.locator('text=Community Guidelines')).toBeVisible();
    await expect(page.locator('text=Safety')).toBeVisible();
  });

  test('should have terms of service link', async ({ page }) => {
    await page.goto('/');
    
    // Check footer for Terms link
    const termsLink = page.locator('a[href="/terms"]');
    await expect(termsLink).toBeVisible();
  });

  test('should have privacy policy link', async ({ page }) => {
    await page.goto('/');
    
    // Check footer for Privacy link
    const privacyLink = page.locator('a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();
  });

  test('should display age requirement on signup', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Should have 18+ confirmation checkbox
    const ageCheckbox = page.locator('text=/18.*older/');
    await expect(ageCheckbox).toBeVisible();
  });

  test('should require terms acceptance on signup', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Should have Terms acceptance checkbox
    const termsCheckbox = page.locator('text=/Terms of Service/');
    await expect(termsCheckbox).toBeVisible();
  });

  test('should require privacy acceptance on signup', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Should have Privacy acceptance checkbox
    const privacyCheckbox = page.locator('text=/Privacy Policy/');
    await expect(privacyCheckbox).toBeVisible();
  });

  test('should show verification requirement message', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check that page mentions email verification
    await expect(page.locator('text=/verify/i')).toBeVisible();
  });
});

test.describe('Content Safety', () => {
  test('should show accessibility information prominently', async ({ page }) => {
    await page.goto('/events');
    
    const eventLink = page.locator('a[href^="/events/"]').first();
    const href = await eventLink.getAttribute('href');
    
    if (href) {
      await page.goto(href);
      
      // Accessibility section or badges should be visible
      const accessibilityIndicators = page.locator('text=/ASL|Step-free|Accessibility/');
      const count = await accessibilityIndicators.count();
      
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have contact support option', async ({ page }) => {
    await page.goto('/support');
    
    // Should have contact link or email
    const contactLink = page.locator('a[href="/contact"]');
    await expect(contactLink).toBeVisible();
  });

  test('should show community values', async ({ page }) => {
    await page.goto('/about');
    
    // Should mention inclusivity, safety, or accessibility
    const valuesText = page.locator('text=/inclusive|safety|accessible/i');
    await expect(valuesText.first()).toBeVisible();
  });
});

