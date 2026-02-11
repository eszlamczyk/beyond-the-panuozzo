import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { EmailDomainGuard } from './email-domain.guard';

function createMockContext(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('EmailDomainGuard', () => {
  let guard: EmailDomainGuard;

  beforeEach(() => {
    guard = new EmailDomainGuard({ allowedEmailDomain: 'example.com' });
  });

  it('should allow a user with the correct email domain', () => {
    const ctx = createMockContext({
      sub: '1',
      email: 'alice@example.com',
      name: 'Alice',
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should reject a user with a different email domain', () => {
    const ctx = createMockContext({
      sub: '1',
      email: 'alice@evil.com',
      name: 'Alice',
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should reject a user with no email', () => {
    const ctx = createMockContext({ sub: '1', name: 'No Email' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should reject when there is no user on the request', () => {
    const ctx = createMockContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should not match a domain that is a suffix of the allowed domain', () => {
    const ctx = createMockContext({
      sub: '1',
      email: 'alice@notexample.com',
      name: 'Alice',
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
