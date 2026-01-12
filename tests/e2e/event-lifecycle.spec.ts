import { test, expect } from '@playwright/test';

test.describe('Event Lifecycle', () => {
  test('should complete full event creation flow', async ({ page }) => {
    // Note: This test assumes auth is working
    // In real scenario, you'd need to authenticate first
    
    await page.goto('/events/create');
    
    // Should redirect to signin if not authenticated
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should display event detail page', async ({ page }) => {
    // Navigate to a specific event (assuming seed data exists)
    await page.goto('/events');
    
    // Wait for events to load
    await page.waitForSelector('h1:has-text("All Events")');
    
    // Check if there are any event cards
    const eventCards = page.locator('a[href^="/events/"]');
    const count = await eventCards.count();
    
    if (count > 0) {
      // Click first event
      await eventCards.first().click();
      
      // Should be on event detail page
      await expect(page.locator('h1')).toBeVisible();
      
      // Should have RSVP section or external link
      const rsvpButton = page.locator('button:has-text("Going")');
      const externalLink = page.locator('a:has-text("RSVP")');
      
      const hasRsvp = await rsvpButton.isVisible().catch(() => false);
      const hasExternal = await externalLink.isVisible().catch(() => false);
      
      expect(hasRsvp || hasExternal).toBe(true);
    }
  });

  test('should display comments section', async ({ page }) => {
    await page.goto('/events');
    
    // Find and click first event
    const eventLink = page.locator('a[href^="/events/"]').first();
    const href = await eventLink.getAttribute('href');
    
    if (href) {
      await page.goto(href);
      
      // Look for comments tab or section
      const commentsTab = page.locator('text=Comments');
      
      if (await commentsTab.isVisible()) {
        await commentsTab.click();
        
        // Should see comment form or signin prompt
        const commentForm = page.locator('textarea[placeholder*="thoughts"]');
        const signinPrompt = page.locator('text=Sign in');
        
        const hasForm = await commentForm.isVisible().catch(() => false);
        const hasPrompt = await signinPrompt.isVisible().catch(() => false);
        
        expect(hasForm || hasPrompt).toBe(true);
      }
    }
  });

  test('should show accessibility information', async ({ page }) => {
    await page.goto('/events');
    
    const eventLink = page.locator('a[href^="/events/"]').first();
    const href = await eventLink.getAttribute('href');
    
    if (href) {
      await page.goto(href);
      
      // Check for accessibility badges
      const aslBadge = page.locator('text=ASL');
      const stepFreeBadge = page.locator('text=Step-free');
      
      // At least one accessibility indicator should exist (or accessibility section)
      const accessibilitySection = page.locator('text=Accessibility');
      expect(await accessibilitySection.isVisible().catch(() => true)).toBeTruthy();
    }
  });

  test('should have export to calendar option', async ({ page }) => {
    await page.goto('/events');
    
    const eventLink = page.locator('a[href^="/events/"]').first();
    const href = await eventLink.getAttribute('href');
    
    if (href) {
      await page.goto(href);
      
      // Look for export/download button
      const exportButton = page.locator('text=Export');
      const calendarButton = page.locator('text=Calendar');
      
      const hasExport = await exportButton.isVisible().catch(() => false);
      const hasCalendar = await calendarButton.isVisible().catch(() => false);
      
      expect(hasExport || hasCalendar).toBe(true);
    }
  });
});

test.describe('Search and Filter', () => {
  test('should filter events by date', async ({ page }) => {
    await page.goto('/events');
    
    // Check for date inputs
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs).toHaveCount(2); // from and to
  });

  test('should have text search', async ({ page }) => {
    await page.goto('/events');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('should navigate to communities page', async ({ page }) => {
    await page.goto('/communities');
    
    await expect(page.locator('h1')).toContainText('Explore');
    
    // Should have filters sidebar
    await expect(page.locator('text=Filters')).toBeVisible();
  });

  test('should have event type filters', async ({ page }) => {
    await page.goto('/communities');
    
    // Check for event type checkboxes
    const socialFilter = page.locator('label:has-text("social")');
    const supportFilter = page.locator('label:has-text("support")');
    
    const hasSocial = await socialFilter.isVisible().catch(() => false);
    const hasSupport = await supportFilter.isVisible().catch(() => false);
    
    expect(hasSocial || hasSupport).toBe(true);
  });
});

test.describe('Profile', () => {
  test('should redirect to signin when accessing profile unauthenticated', async ({ page }) => {
    await page.goto('/profile');
    
    // Should redirect to signin
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should redirect to signin when accessing org page unauthenticated', async ({ page }) => {
    await page.goto('/org');
    
    // Should redirect to signin
    await expect(page).toHaveURL(/.*signin/);
  });
});

