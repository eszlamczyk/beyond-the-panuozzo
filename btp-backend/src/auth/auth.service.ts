import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { authConfig } from './auth.config';
import { GoogleUser } from './google.strategy';

/** Shape of the payload encoded into Google OAuth's `state` parameter. */
export interface StatePayload {
  redirectUri: string | undefined;
  clientState: string | undefined;
}

/**
 * Core authentication helpers.
 *
 * Responsible for redirect-URI validation, JWT generation, and encoding /
 * decoding the OAuth `state` parameter that carries the client's redirect URI
 * through the Google OAuth round-trip.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  /** Returns `true` if the URI is present in the configured whitelist */
  validateRedirectUri(uri: string): boolean {
    return this.config.allowedRedirectUris.includes(uri);
  }

  /** Signs a JWT containing the user's Google ID, email, and display name. */
  generateJwt(user: GoogleUser): string {
    return this.jwtService.sign({
      sub: user.googleId,
      email: user.email,
      name: user.displayName,
    });
  }

  /** Base64url-encodes a {@link StatePayload} for use as Google OAuth's `state` param. */
  encodeState(redirectUri: string, clientState?: string): string {
    const payload: StatePayload = { redirectUri, clientState };
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  /** Decodes a base64url-encoded `state` string back into a {@link StatePayload}. */
  decodeState(state: string): StatePayload {
    const json = Buffer.from(state, 'base64url').toString('utf-8');
    return JSON.parse(json) as StatePayload;
  }
}
