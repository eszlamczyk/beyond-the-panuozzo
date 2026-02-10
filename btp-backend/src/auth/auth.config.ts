import { registerAs } from '@nestjs/config';

interface GoogleConfig {
  /** OAuth 2.0 Client ID from Google Cloud Console. */
  clientId: string | undefined;
  /** OAuth 2.0 Client Secret from Google Cloud Console. */
  clientSecret: string | undefined;
  /** The callback URL registered in Google Console (e.g. `http://localhost:3000/auth/google/callback`). */
  callbackUrl: string | undefined;
}

interface JwtConfig {
  /** Secret key used to sign JWTs. Should be a long random string. */
  secret: string | undefined;
}

/** Namespaced configuration for the auth module. */
export interface AuthConfig {
  google: GoogleConfig;
  jwt: JwtConfig;
  /** Whitelist of URIs the OAuth flow is allowed to redirect to after login (e.g. `vscode://…`, `http://localhost:3000/callback`). */
  allowedRedirectUris: string[];
}

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    allowedRedirectUris: (process.env.ALLOWED_REDIRECT_URIS ?? '')
      .split(',')
      .map((uri) => uri.trim())
      .filter(Boolean),
  }),
);
