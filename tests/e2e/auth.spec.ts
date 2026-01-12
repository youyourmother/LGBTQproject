import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sign up page', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await expect(page.locator('h1')).toContainText('Join +Philia Hub');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should show validation errors for invalid signup', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // HTML5 validation should prevent submission
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await page.click('text=Sign in');
    await expect(page).toHaveURL(/.*signin/);
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should display OAuth buttons', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await expect(page.locator('text=Google')).toBeVisible();
    await expect(page.locator('text=Apple')).toBeVisible();
  });

  test('should navigate to password reset', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.click('text=Forgot password?');
    await expect(page).toHaveURL(/.*reset-password/);
    await expect(page.locator('h1')).toContainText('Reset Password');
  });
});

test.describe('Homepage', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Find your people')).toBeVisible();
    await expect(page.locator('text=Find your power')).toBeVisible();
  });

  test('should navigate to events from homepage', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Explore Events');
    await expect(page).toHaveURL(/.*communities/);
  });

  test('should navigate to sign up from homepage', async ({ page }) => {
    await page.goto('/');
    
    const signUpButton = page.locator('a:has-text("Create Account")').first();
    await signUpButton.click();
    await expect(page).toHaveURL(/.*signup/);
  });
});

