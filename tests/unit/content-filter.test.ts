import { containsBannedTerms, sanitizeContent, checkContent } from '@/lib/content-filter';

describe('Content Filter', () => {
  describe('containsBannedTerms', () => {
    it('should detect spam keywords', () => {
      expect(containsBannedTerms('This is spam content')).toBe(true);
      expect(containsBannedTerms('Check out this SCAM')).toBe(true);
    });

    it('should allow clean content', () => {
      expect(containsBannedTerms('This is a great event!')).toBe(false);
      expect(containsBannedTerms('Looking forward to meeting everyone')).toBe(false);
    });
  });

  describe('sanitizeContent', () => {
    it('should remove excessive whitespace', () => {
      const input = 'Hello    world   with   spaces';
      const expected = 'Hello world with spaces';
      expect(sanitizeContent(input)).toBe(expected);
    });

    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> world';
      const expected = 'Hello  world';
      expect(sanitizeContent(input)).toBe(expected);
    });

    it('should trim leading and trailing whitespace', () => {
      const input = '  Hello world  ';
      const expected = 'Hello world';
      expect(sanitizeContent(input)).toBe(expected);
    });
  });

  describe('checkContent', () => {
    it('should pass clean content', () => {
      const result = checkContent('This is a wonderful LGBTQ+ event');
      expect(result.isClean).toBe(true);
    });

    it('should flag content with banned terms', () => {
      const result = checkContent('This is spam content');
      expect(result.isClean).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should flag excessive capitalization', () => {
      const result = checkContent('THIS IS ALL CAPS AND LOOKS LIKE SPAM!!!');
      expect(result.isClean).toBe(false);
      expect(result.reason).toContain('capitalization');
    });

    it('should allow some caps in normal text', () => {
      const result = checkContent('Join us for PRIDE Month celebrations!');
      expect(result.isClean).toBe(true);
    });
  });
});

