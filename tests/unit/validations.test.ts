import { signUpSchema, signInSchema } from '@/lib/validations/auth';
import { createEventSchema } from '@/lib/validations/event';
import { createCommentSchema } from '@/lib/validations/comment';
import { contactFormSchema } from '@/lib/validations/contact';

describe('Auth Validations', () => {
  describe('signUpSchema', () => {
    it('should validate a valid signup', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        ageConfirmed: true,
        termsAccepted: true,
        privacyAccepted: true,
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject signup without age confirmation', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        ageConfirmed: false,
        termsAccepted: true,
        privacyAccepted: true,
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
        ageConfirmed: true,
        termsAccepted: true,
        privacyAccepted: true,
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Test User',
        email: 'not-an-email',
        password: 'password123',
        ageConfirmed: true,
        termsAccepted: true,
        privacyAccepted: true,
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('signInSchema', () => {
    it('should validate valid credentials', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('Event Validations', () => {
  describe('createEventSchema', () => {
    it('should validate a valid event', () => {
      const validData = {
        title: 'Pride Month Celebration',
        organizerType: 'individual' as const,
        startsAt: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        endsAt: new Date(Date.now() + 90000000).toISOString(), // tomorrow + 1 hour
        timezone: 'America/Detroit',
        location: {
          placeId: 'test-place-id',
          formattedAddress: '123 Main St, Detroit, MI',
          geo: {
            type: 'Point' as const,
            coordinates: [-83.0458, 42.3314] as [number, number],
          },
        },
        types: ['social'],
        tags: ['pride'],
        shortDescription: 'Join us for a celebration!',
        accessibility: {
          asl: false,
          stepFree: true,
        },
        rsvpMode: 'on_platform' as const,
        visibility: 'public' as const,
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject end time before start time', () => {
      const invalidData = {
        title: 'Pride Month Celebration',
        organizerType: 'individual' as const,
        startsAt: new Date(Date.now() + 90000000).toISOString(),
        endsAt: new Date(Date.now() + 86400000).toISOString(), // before start
        timezone: 'America/Detroit',
        location: {
          placeId: 'test-place-id',
          formattedAddress: '123 Main St, Detroit, MI',
          geo: {
            type: 'Point' as const,
            coordinates: [-83.0458, 42.3314] as [number, number],
          },
        },
        types: ['social'],
        tags: [],
        shortDescription: 'Join us for a celebration!',
        accessibility: {
          asl: false,
          stepFree: false,
        },
        rsvpMode: 'on_platform' as const,
        visibility: 'public' as const,
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require at least one event type', () => {
      const invalidData = {
        title: 'Pride Month Celebration',
        organizerType: 'individual' as const,
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        endsAt: new Date(Date.now() + 90000000).toISOString(),
        timezone: 'America/Detroit',
        location: {
          placeId: 'test-place-id',
          formattedAddress: '123 Main St, Detroit, MI',
          geo: {
            type: 'Point' as const,
            coordinates: [-83.0458, 42.3314] as [number, number],
          },
        },
        types: [],
        tags: [],
        shortDescription: 'Join us for a celebration!',
        accessibility: {
          asl: false,
          stepFree: false,
        },
        rsvpMode: 'on_platform' as const,
        visibility: 'public' as const,
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Comment Validations', () => {
  describe('createCommentSchema', () => {
    it('should validate a valid comment', () => {
      const validData = {
        eventId: '507f1f77bcf86cd799439011',
        body: 'This looks amazing! Can\'t wait to attend!',
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty comment', () => {
      const invalidData = {
        eventId: '507f1f77bcf86cd799439011',
        body: '',
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject comment exceeding max length', () => {
      const invalidData = {
        eventId: '507f1f77bcf86cd799439011',
        body: 'a'.repeat(2001), // exceeds 2000 char limit
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Contact Form Validations', () => {
  describe('contactFormSchema', () => {
    it('should validate a valid contact form', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Question about events',
        message: 'I have a question about creating events on the platform.',
      };

      const result = contactFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject message shorter than 20 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Question',
        message: 'Short message',
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

