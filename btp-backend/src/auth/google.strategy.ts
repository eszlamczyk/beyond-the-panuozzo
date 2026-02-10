import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { authConfig } from './auth.config';

/** Normalized user profile returned by the Google OAuth strategy. */
export interface GoogleUser {
  googleId: string;
  email: string;
  displayName: string;
  photo: string | undefined;
}

const REQUIRED_SCOPES = ['email', 'profile'];

/**
 * Passport strategy for Google OAuth 2.0.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(authConfig.KEY)
    config: ConfigType<typeof authConfig>,
  ) {
    super({
      clientID: config.google.clientId ?? '',
      clientSecret: config.google.clientSecret ?? '',
      callbackURL: config.google.callbackUrl,
      scope: REQUIRED_SCOPES,
    });
  }

  /** Called by Passport after a successful Google login. Extracts the relevant fields from the raw Google profile. */
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      emails?: { value: string }[];
      photos?: { value: string }[];
    },
    done: VerifyCallback,
  ): void {
    const user: GoogleUser = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      displayName: profile.displayName,
      photo: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
