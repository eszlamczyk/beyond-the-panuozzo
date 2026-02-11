import { registerAs } from '@nestjs/config';

interface GoogleConfig {
  /** OAuth 2.0 Client ID from Google Cloud Console. */
  clientId: string;
  /** OAuth 2.0 Client Secret from Google Cloud Console. */
  clientSecret: string;
  /** The callback URL registered in Google Console (e.g. `http://localhost:3000/auth/google/callback`). */
  callbackUrl: string;
}

interface JwtConfig {
  /** Secret key used to sign JWTs. Should be a long random string. */
  secret: string;
}

/** Namespaced configuration for the authentication module. */
export interface AuthenticationConfig {
  google: GoogleConfig;
  jwt: JwtConfig;
  /** Whitelist of URIs the OAuth flow is allowed to redirect to after login (e.g. `vscode://…`, `http://localhost:3000/callback`). */
  allowedRedirectUris: string[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const authenticationConfig = registerAs(
  'authentication',
  (): AuthenticationConfig => ({
    google: {
      clientId: requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
      callbackUrl: requireEnv('GOOGLE_CALLBACK_URL'),
    },
    jwt: {
      secret: requireEnv('JWT_SECRET'),
    },
    allowedRedirectUris: (process.env.ALLOWED_REDIRECT_URIS ?? '')
      .split(',')
      .map((uri) => uri.trim())
      .filter(Boolean),
  }),
);
