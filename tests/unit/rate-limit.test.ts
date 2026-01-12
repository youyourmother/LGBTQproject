import {
  rateLimit,
  authRateLimit,
  createEventRateLimit,
  commentRateLimit,
  reportRateLimit,
} from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear any existing rate limit state
    jest.clearAllMocks();
  });

  describe('Basic rate limiter', () => {
    it('should allow requests within limit', () => {
      const identifier = 'test-user-1';
      const options = { interval: 60000, maxRequests: 5 };

      for (let i = 0; i < 5; i++) {
        const result = rateLimit(identifier, options);
        expect(result.success).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user-2';
      const options = { interval: 60000, maxRequests: 3 };

      // Use up all allowed requests
      for (let i = 0; i < 3; i++) {
        rateLimit(identifier, options);
      }

      // Next request should be blocked
      const result = rateLimit(identifier, options);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should provide correct remaining count', () => {
      const identifier = 'test-user-3';
      const options = { interval: 60000, maxRequests: 10 };

      const result1 = rateLimit(identifier, options);
      expect(result1.remaining).toBe(9);

      const result2 = rateLimit(identifier, options);
      expect(result2.remaining).toBe(8);
    });

    it('should reset after interval', () => {
      const identifier = 'test-user-4';
      const options = { interval: 100, maxRequests: 2 }; // 100ms interval

      // Use up limit
      rateLimit(identifier, options);
      rateLimit(identifier, options);
      
      const blocked = rateLimit(identifier, options);
      expect(blocked.success).toBe(false);

      // Wait for interval to pass
      return new Promise((resolve) => {
        setTimeout(() => {
          const allowed = rateLimit(identifier, options);
          expect(allowed.success).toBe(true);
          resolve(undefined);
        }, 150);
      });
    });
  });

  describe('Preset rate limiters', () => {
    it('authRateLimit should have correct limits', () => {
      const identifier = 'auth-test';
      
      for (let i = 0; i < 5; i++) {
        const result = authRateLimit(identifier);
        expect(result.success).toBe(true);
      }

      const result = authRateLimit(identifier);
      expect(result.success).toBe(false);
    });

    it('createEventRateLimit should have correct limits', () => {
      const identifier = 'event-test';
      
      for (let i = 0; i < 10; i++) {
        const result = createEventRateLimit(identifier);
        expect(result.success).toBe(true);
      }

      const result = createEventRateLimit(identifier);
      expect(result.success).toBe(false);
    });

    it('commentRateLimit should allow high volume', () => {
      const identifier = 'comment-test';
      
      for (let i = 0; i < 20; i++) {
        const result = commentRateLimit(identifier);
        expect(result.success).toBe(true);
      }

      const result = commentRateLimit(identifier);
      expect(result.success).toBe(false);
    });

    it('reportRateLimit should be restrictive', () => {
      const identifier = 'report-test';
      
      for (let i = 0; i < 5; i++) {
        const result = reportRateLimit(identifier);
        expect(result.success).toBe(true);
      }

      const result = reportRateLimit(identifier);
      expect(result.success).toBe(false);
    });
  });

  describe('Different identifiers', () => {
    it('should track different users separately', () => {
      const options = { interval: 60000, maxRequests: 2 };

      rateLimit('user-a', options);
      rateLimit('user-a', options);
      
      const userABlocked = rateLimit('user-a', options);
      expect(userABlocked.success).toBe(false);

      // User B should still be allowed
      const userBAllowed = rateLimit('user-b', options);
      expect(userBAllowed.success).toBe(true);
    });
  });
});

