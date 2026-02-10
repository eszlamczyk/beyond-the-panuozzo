import {
  BadRequestException,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { z } from 'zod';
import { AuthenticationService } from './authentication.service';

/** Expected query parameters for authentication request. */
const googleAuthQuerySchema = z.object({
  redirect_uri: z.string().min(1),
  state: z.string().optional(),
});

/** Google authentication guard */
@Injectable()
export class GoogleAuthenticationGuard extends AuthGuard('google') {
  constructor(
    @Inject(AuthenticationService)
    private readonly authenticationService: AuthenticationService,
  ) {
    super();
  }

  /** Validates the redirect URI before delegating to Passport's Google strategy. */
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    this.assertValidRedirectUri(request);
    return super.canActivate(context);
  }

  /**
   * Encodes the client's `redirect_uri` and optional `state` into Google's
   * OAuth `state` parameter so they survive the round-trip without requiring
   * server-side sessions.
   */
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const { redirect_uri: redirectUri, state: clientState } =
      googleAuthQuerySchema.partial().parse(request.query);

    const statePayload = JSON.stringify({ redirectUri, clientState });
    const encodedState = Buffer.from(statePayload).toString('base64url');

    return { state: encodedState };
  }

  /** Ensures the request carries a valid, allowed redirect URI. */
  private assertValidRedirectUri(request: Request): void {
    const result = googleAuthQuerySchema.safeParse(request.query);

    if (result.success) {
      if (
        !this.authenticationService.validateRedirectUri(
          result.data.redirect_uri,
        )
      ) {
        throw new BadRequestException(
          'Invalid redirect_uri. Must be a whitelisted URI.',
        );
      }
    } else if (request.query?.state === undefined) {
      throw new BadRequestException('Missing redirect_uri query parameter.');
    }
  }
}
