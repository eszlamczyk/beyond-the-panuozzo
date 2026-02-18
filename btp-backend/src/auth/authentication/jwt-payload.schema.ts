import { z } from 'zod';

/** Schema for the validated JWT payload attached to `req.user`. */
export const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.email(),
  name: z.string(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
