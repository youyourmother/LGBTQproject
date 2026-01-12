import { z } from 'zod';

export const createCommentSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  body: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
});

export const createReactionSchema = z.object({
  commentId: z.string().min(1, 'Comment ID is required'),
  emoji: z.string().min(1).max(10),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateReactionInput = z.infer<typeof createReactionSchema>;

