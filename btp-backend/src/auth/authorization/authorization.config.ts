import { registerAs } from '@nestjs/config';

/** Namespaced configuration for the authorization module. */
export interface AuthorizationConfig {
  /** Email domain that users must belong to (e.g. `example.com`). */
  allowedEmailDomain: string;
  /** Emails that are allowed to log in with the `admin` capability. */
  adminEmails: string[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const authorizationConfig = registerAs(
  'authorization',
  (): AuthorizationConfig => ({
    allowedEmailDomain: requireEnv('ALLOWED_EMAIL_DOMAIN'),
    adminEmails: (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  }),
);
