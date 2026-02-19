import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Capability, jwtPayloadSchema } from '../authentication/jwt-payload.schema';

export const REQUIRED_CAPABILITY_KEY = 'requiredCapability';

/**
 * Guard that rejects requests whose JWT does not carry the required capability.
 *
 * The required capability is read from route metadata set by the
 * {@link Authenticated} decorator. If no metadata is set, the guard passes
 * (any capability is accepted).
 */
@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Capability | undefined>(
      REQUIRED_CAPABILITY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const result = jwtPayloadSchema.safeParse(request.user);

    if (!result.success || result.data.capability !== required) {
      throw new ForbiddenException(
        `This action requires the '${required}' capability.`,
      );
    }

    return true;
  }
}
