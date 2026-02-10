import { JwtStrategy, JwtPayload } from './jwt.strategy';


describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const mockConfig = {
      google: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        callbackUrl: 'http://localhost:3000/auth/google/callback',
      },
      jwt: { secret: 'test-secret' },
      allowedRedirectUris: [],
    };

    strategy = new JwtStrategy(mockConfig as any);
  });

  it('should return the payload as-is', () => {
    const payload: JwtPayload = {
      sub: '12345',
      email: 'user@example.com',
      name: 'Test User',
    };

    expect(strategy.validate(payload)).toEqual(payload);
  });
});
