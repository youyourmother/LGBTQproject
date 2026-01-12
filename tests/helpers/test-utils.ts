/**
 * Test utilities and helpers
 */

export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: new Date(),
  role: 'member' as const,
  settings: {
    emailOptIn: true,
    profileVisibility: 'public' as const,
  },
};

export const mockAdmin = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Admin User',
  email: 'admin@example.com',
  emailVerified: new Date(),
  role: 'admin' as const,
  settings: {
    emailOptIn: true,
    profileVisibility: 'public' as const,
  },
};

export const mockEvent = {
  _id: '507f1f77bcf86cd799439013',
  title: 'Test Event',
  slug: 'test-event',
  organizerType: 'individual' as const,
  organizerId: '507f1f77bcf86cd799439011',
  startsAt: new Date('2025-06-01T18:00:00Z'),
  endsAt: new Date('2025-06-01T22:00:00Z'),
  timezone: 'America/Detroit',
  location: {
    placeId: 'test-place-id',
    formattedAddress: '123 Test St, Detroit, MI',
    geo: {
      type: 'Point' as const,
      coordinates: [-83.0458, 42.3314] as [number, number],
    },
  },
  types: ['social'],
  tags: ['test'],
  shortDescription: 'This is a test event',
  longDescription: 'Full description of the test event',
  accessibility: {
    asl: false,
    stepFree: true,
  },
  rsvpMode: 'on_platform' as const,
  visibility: 'public' as const,
  status: 'active' as const,
  metrics: {
    views: 0,
    rsvps: 0,
    saves: 0,
  },
};

export const mockComment = {
  _id: '507f1f77bcf86cd799439014',
  eventId: '507f1f77bcf86cd799439013',
  authorId: '507f1f77bcf86cd799439011',
  body: 'This is a test comment',
  status: 'visible' as const,
  createdAt: new Date(),
};

export const mockOrganization = {
  _id: '507f1f77bcf86cd799439015',
  name: 'Test Organization',
  slug: 'test-organization',
  description: 'A test organization for testing',
  verified: true,
  owners: ['507f1f77bcf86cd799439011'],
  members: ['507f1f77bcf86cd799439011'],
  tags: ['test', 'community'],
};

export const mockRSVP = {
  _id: '507f1f77bcf86cd799439016',
  eventId: '507f1f77bcf86cd799439013',
  userId: '507f1f77bcf86cd799439011',
  status: 'going' as const,
  createdAt: new Date(),
};

export const mockReport = {
  _id: '507f1f77bcf86cd799439017',
  targetType: 'event' as const,
  targetId: '507f1f77bcf86cd799439013',
  reporterId: '507f1f77bcf86cd799439011',
  reason: 'This content is inappropriate',
  status: 'open' as const,
  createdAt: new Date(),
};

/**
 * Helper to generate mock MongoDB ObjectId
 */
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomHex = 'x'.repeat(16).replace(/x/g, () => 
    Math.floor(Math.random() * 16).toString(16)
  );
  return (timestamp + randomHex).substring(0, 24);
}

/**
 * Helper to create mock session
 */
export function createMockSession(user: any = mockUser) {
  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      pronouns: user.pronouns,
      emailVerified: user.emailVerified,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Helper to wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

