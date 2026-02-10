import {
  BadRequestException,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from './auth.service';

/** Google authentication guard */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {
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
    const redirectUri = (request.query?.redirect_uri as string) ?? undefined;
    const clientState = (request.query?.state as string) ?? undefined;

    const statePayload = JSON.stringify({ redirectUri, clientState });
    const encodedState = Buffer.from(statePayload).toString('base64url');

    return { state: encodedState };
  }

  /**
   * Ensures the request carries a valid, allowed redirect URI.
   */
  private assertValidRedirectUri(request: Request): void {
    const redirectUri = request.query?.redirect_uri as string | undefined;

    if (redirectUri !== undefined) {
      if (!this.authService.validateRedirectUri(redirectUri)) {
        throw new BadRequestException(
          'Invalid redirect_uri. Must be a whitelisted URI.',
        );
      }
    } else if (request.query?.state === undefined) {
      throw new BadRequestException('Missing redirect_uri query parameter.');
    }
  }
}
