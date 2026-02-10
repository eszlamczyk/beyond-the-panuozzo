import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Request } from 'express';
import { jwtPayloadSchema } from '../authentication/jwt-payload.schema';
import { authorizationConfig } from './authorization.config';

/**
 * Guard that rejects requests whose authenticated user does not belong to the
 * allowed email domain.
 *
 * Must be applied **after** {@link JwtAuthenticationGuard} so that `req.user` is already
 * populated with the decoded JWT payload.
 */
@Injectable()
export class EmailDomainGuard implements CanActivate {
  constructor(
    @Inject(authorizationConfig.KEY)
    private readonly config: ConfigType<typeof authorizationConfig>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const result = jwtPayloadSchema.safeParse(request.user);

    if (
      !result.success ||
      !result.data.email.endsWith(`@${this.config.allowedEmailDomain}`)
    ) {
      throw new UnauthorizedException('Email domain not allowed.');
    }

    return true;
  }
}
