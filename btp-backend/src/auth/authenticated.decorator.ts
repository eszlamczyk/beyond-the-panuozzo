import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from './authentication/jwt-authentication.guard';
import { EmailDomainGuard } from './authorization/email-domain.guard';

/**
 * Composite decorator that requires a valid JWT **and** a matching email domain.
 *
 * Apply at the controller level to protect all routes, or on individual methods.
 */
export const Authenticated = () =>
  applyDecorators(UseGuards(JwtAuthenticationGuard, EmailDomainGuard));
