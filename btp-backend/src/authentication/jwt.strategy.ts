import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { authenticationConfig } from './authentication.config';

/** Shape of the validated JWT payload attached to `req.user`. */
export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

/**
 * Passport strategy that validates JWT bearer tokens.
 *
 * Extracts the token from the `Authorization: Bearer <token>` header,
 * verifies its signature and expiration using the configured secret,
 * and attaches the decoded payload to the request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(authenticationConfig.KEY)
    config: ConfigType<typeof authenticationConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  /** Returns the payload as `req.user`. */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
