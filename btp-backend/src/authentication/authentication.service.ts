import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';
import { authenticationConfig } from './authentication.config';
import { GoogleUser } from './google-user.schema';

/** Schema for the payload encoded into Google OAuth's `state` parameter. */
const statePayloadSchema = z.object({
  redirectUri: z.string().min(1),
  clientState: z.string().optional(),
});

/** Shape of the payload encoded into Google OAuth's `state` parameter. */
export type StatePayload = z.infer<typeof statePayloadSchema>;

/**
 * Core authentication helpers.
 *
 * Responsible for redirect-URI validation, JWT generation, and encoding /
 * decoding the OAuth `state` parameter that carries the client's redirect URI
 * through the Google OAuth round-trip.
 */
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(authenticationConfig.KEY)
    private readonly config: ConfigType<typeof authenticationConfig>,
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

  /** Decodes a base64url-encoded `state` string back into a {@link StatePayload}. Throws if the payload is invalid. */
  decodeState(state: string): StatePayload {
    const json = Buffer.from(state, 'base64url').toString('utf-8');
    const result = statePayloadSchema.safeParse(JSON.parse(json));

    if (!result.success) {
      throw new BadRequestException('Invalid state payload.');
    }

    return result.data;
  }
}
