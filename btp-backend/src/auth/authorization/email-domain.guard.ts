import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Request } from 'express';
import { z } from 'zod';
import { authorizationConfig } from './authorization.config';

const emailSchema = z.object({ email: z.email() });

/**
 * Guard that rejects requests whose authenticated user does not belong to the
 * allowed email domain.
 *
 * Must be applied **after** a guard that populates `req.user` with an object
 * containing an `email` field (e.g. {@link JwtAuthenticationGuard} or
 * {@link GoogleAuthenticationGuard}).
 */
@Injectable()
export class EmailDomainGuard implements CanActivate {
  constructor(
    @Inject(authorizationConfig.KEY)
    private readonly config: ConfigType<typeof authorizationConfig>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const result = emailSchema.safeParse(request.user);

    if (
      !result.success ||
      !result.data.email.endsWith(`@${this.config.allowedEmailDomain}`)
    ) {
      throw new UnauthorizedException('Email domain not allowed.');
    }

    return true;
  }
}
