import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  organizerType: z.enum(['individual', 'organization']),
  organizerId: z.string().optional(),
  startsAt: z.string().or(z.date()),
  endsAt: z.string().or(z.date()),
  timezone: z.string().default('America/Detroit'),
  location: z.object({
    placeId: z.string().min(1, 'Location is required'),
    formattedAddress: z.string().min(1),
    geo: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]),
    }),
    roomNotes: z.string().max(200).optional(),
  }),
  types: z.array(z.string()).min(1, 'Select at least one event type'),
  tags: z.array(z.string()),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(280),
  longDescription: z.string().max(5000).optional(),
  accessibility: z.object({
    asl: z.boolean().default(false),
    stepFree: z.boolean().default(false),
    quietRoom: z.boolean().optional(),
    notes: z.string().max(500).optional(),
  }),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  capacity: z.number().int().min(1).optional(),
  rsvpMode: z.enum(['external', 'on_platform']).default('on_platform'),
  rsvpUrl: z.string().url().optional().or(z.literal('')),
  visibility: z.enum(['public', 'unlisted']).default('public'),
}).refine(
  (data) => {
    const start = new Date(data.startsAt);
    const end = new Date(data.endsAt);
    return end > start;
  },
  {
    message: 'End time must be after start time',
    path: ['endsAt'],
  }
).refine(
  (data) => {
    if (data.rsvpMode === 'external') {
      return !!data.rsvpUrl;
    }
    return true;
  },
  {
    message: 'RSVP URL is required for external RSVP mode',
    path: ['rsvpUrl'],
  }
);

export const updateEventSchema = createEventSchema.partial();

export const searchEventsSchema = z.object({
  query: z.string().optional(),
  from: z.string().or(z.date()).optional(),
  to: z.string().or(z.date()).optional(),
  types: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().min(1).max(100).optional(), // in km
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type SearchEventsInput = z.infer<typeof searchEventsSchema>;

