import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have skip link on all pages', async ({ page }) => {
    const pages = ['/', '/events', '/about', '/communities', '/support'];

    for (const url of pages) {
      await page.goto(url);
      
      const skipLink = page.locator('a.skip-link');
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    }
  });

  test('should have single h1 per page', async ({ page }) => {
    const pages = ['/', '/events', '/about', '/terms', '/privacy', '/support', '/contact'];

    for (const url of pages) {
      await page.goto(url);
      
      const h1Elements = page.locator('h1');
      const count = await h1Elements.count();
      
      expect(count).toBe(1);
    }
  });

  test('should have proper page titles', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/\+Philia Hub/);

    await page.goto('/about');
    await expect(page).toHaveTitle(/About/);

    await page.goto('/terms');
    await expect(page).toHaveTitle(/Terms/);

    await page.goto('/privacy');
    await expect(page).toHaveTitle(/Privacy/);

    await page.goto('/support');
    await expect(page).toHaveTitle(/Support/);

    await page.goto('/contact');
    await expect(page).toHaveTitle(/Contact/);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check that all form inputs have associated labels
    const nameInput = page.locator('input#name');
    const nameLabel = page.locator('label[for="name"]');
    
    await expect(nameInput).toBeVisible();
    await expect(nameLabel).toBeVisible();

    const emailInput = page.locator('input#email');
    const emailLabel = page.locator('label[for="email"]');
    
    await expect(emailInput).toBeVisible();
    await expect(emailLabel).toBeVisible();

    const passwordInput = page.locator('input#password');
    const passwordLabel = page.locator('label[for="password"]');
    
    await expect(passwordInput).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('should support keyboard navigation in forms', async ({ page }) => {
    await page.goto('/contact');
    
    // Tab through form fields
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // First nav item or name field
    
    // Continue tabbing through form
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Should be able to reach submit button
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'TEXTAREA', 'A']).toContain(focused);
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Check that focused element has visible outline/ring
    const focusedElement = page.locator(':focus-visible');
    await expect(focusedElement).toBeVisible();
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    
    // Check all images have alt attributes
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Alt should exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/');
    
    // Icon-only buttons should have aria-label
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Either has text or aria-label
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Should have main element
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Should have header
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Should have footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation landmark
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for main content area
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - full contrast testing requires specialized tools
    await page.goto('/');
    
    // Check that primary text is visible
    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    const foreground = page.locator('h1').first();
    const foregroundColor = await foreground.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    
    // Basic check that colors are different
    expect(backgroundColor).not.toBe(foregroundColor);
  });
});

