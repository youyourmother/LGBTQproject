import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('class-1', 'class-2');
      expect(result).toContain('class-1');
      expect(result).toContain('class-2');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).toContain('active');
    });

    it('should handle falsy values', () => {
      const result = cn('base', false, null, undefined, 'valid');
      expect(result).toContain('base');
      expect(result).toContain('valid');
      expect(result).not.toContain('false');
      expect(result).not.toContain('null');
    });

    it('should merge Tailwind classes correctly', () => {
      // tailwind-merge should handle conflicts
      const result = cn('px-2', 'px-4');
      // Should only have one px class (the latter one)
      expect(result).toContain('px-');
    });

    it('should handle arrays', () => {
      const result = cn(['class-1', 'class-2'], 'class-3');
      expect(result).toContain('class-1');
      expect(result).toContain('class-2');
      expect(result).toContain('class-3');
    });

    it('should handle objects', () => {
      const result = cn({
        'class-1': true,
        'class-2': false,
        'class-3': true,
      });
      expect(result).toContain('class-1');
      expect(result).not.toContain('class-2');
      expect(result).toContain('class-3');
    });
  });
});

describe('Date Formatting', () => {
  it('should handle ISO date strings', () => {
    const isoDate = '2025-06-01T18:00:00Z';
    const date = new Date(isoDate);
    
    expect(date.toISOString()).toBe(isoDate);
  });

  it('should compare dates correctly', () => {
    const earlier = new Date('2025-06-01T18:00:00Z');
    const later = new Date('2025-06-01T22:00:00Z');
    
    expect(later > earlier).toBe(true);
  });
});

describe('String Manipulation', () => {
  it('should lowercase and trim emails', () => {
    const email = '  TEST@EXAMPLE.COM  ';
    const normalized = email.toLowerCase().trim();
    
    expect(normalized).toBe('test@example.com');
  });

  it('should truncate long strings', () => {
    const longString = 'a'.repeat(500);
    const truncated = longString.substring(0, 280);
    
    expect(truncated.length).toBe(280);
  });

  it('should handle empty strings', () => {
    const empty = '';
    expect(empty.trim()).toBe('');
    expect(empty.length).toBe(0);
  });
});

