import { z } from 'zod';

/** Schema for the normalized user profile returned by the Google OAuth strategy. */
export const googleUserSchema = z.object({
  googleId: z.string(),
  email: z.email(),
  displayName: z.string(),
  photo: z.string().optional(),
});

export type GoogleUser = z.infer<typeof googleUserSchema>;
