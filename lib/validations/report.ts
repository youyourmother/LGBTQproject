import { z } from 'zod';

export const createReportSchema = z.object({
  targetType: z.enum(['event', 'comment', 'user']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.string().min(10, 'Please provide a detailed reason').max(1000),
});

export const updateReportSchema = z.object({
  status: z.enum(['open', 'reviewed', 'dismissed']),
  moderatorNotes: z.string().max(2000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;

