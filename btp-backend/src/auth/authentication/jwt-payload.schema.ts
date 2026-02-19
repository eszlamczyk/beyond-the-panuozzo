import { z } from 'zod';

export const capabilitySchema = z.enum(['user', 'admin']);
export type Capability = z.infer<typeof capabilitySchema>;

/** Schema for the validated JWT payload attached to `req.user`. */
export const jwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.email(),
  name: z.string(),
  capability: capabilitySchema,
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
