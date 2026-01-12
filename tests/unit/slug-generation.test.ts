/**
 * Test slug generation utility
 */

describe('Slug Generation', () => {
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  };

  it('should generate slug from title', () => {
    expect(generateSlug('Pride Month Celebration')).toBe('pride-month-celebration');
  });

  it('should handle special characters', () => {
    expect(generateSlug('LGBTQ+ Event 2025!')).toBe('lgbtq-event-2025');
  });

  it('should handle multiple spaces', () => {
    expect(generateSlug('Pride    Month    Party')).toBe('pride-month-party');
  });

  it('should remove leading and trailing dashes', () => {
    expect(generateSlug('---Pride Event---')).toBe('pride-event');
  });

  it('should truncate to 50 characters', () => {
    const longTitle = 'This is a very long event title that should be truncated to fifty characters maximum';
    const slug = generateSlug(longTitle);
    expect(slug.length).toBeLessThanOrEqual(50);
  });

  it('should handle unicode characters', () => {
    expect(generateSlug('Pride Célébration 🏳️‍🌈')).toBe('pride-c-l-bration');
  });

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should handle numbers', () => {
    expect(generateSlug('Pride 2025 - Event #1')).toBe('pride-2025-event-1');
  });
});

