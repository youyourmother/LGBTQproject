import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  pronouns: z.string().max(50).optional(),
  ageConfirmed: z.boolean().refine((val) => val === true, {
    message: 'You must be 18+ to use this service',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms of Service',
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Privacy Policy',
  }),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const newPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  pronouns: z.string().max(50).optional(),
  settings: z.object({
    emailOptIn: z.boolean(),
    profileVisibility: z.enum(['public', 'members', 'private']),
  }).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

