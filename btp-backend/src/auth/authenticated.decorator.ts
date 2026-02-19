import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import type { Capability } from './authentication/jwt-payload.schema';
import { JwtAuthenticationGuard } from './authentication/jwt-authentication.guard';
import { EmailDomainGuard } from './authorization/email-domain.guard';
import {
  CapabilityGuard,
  REQUIRED_CAPABILITY_KEY,
} from './authorization/capability.guard';

/**
 * Composite decorator that requires a valid JWT **and** a matching email domain.
 *
 * Optionally accepts a required {@link Capability}. When provided, the JWT
 * must carry a matching `capability` claim or the request is rejected with 403.
 *
 * @example
 * \@Authenticated()          // any capability accepted
 * \@Authenticated('admin')   // only admin JWTs accepted
 */
export const Authenticated = (capability?: Capability) =>
  applyDecorators(
    UseGuards(JwtAuthenticationGuard, EmailDomainGuard, CapabilityGuard),
    ...(capability ? [SetMetadata(REQUIRED_CAPABILITY_KEY, capability)] : []),
  );
