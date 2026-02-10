import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { authConfig } from './auth.config';
import type { GoogleUser } from './google.strategy';

describe('AuthService', () => {
  let service: AuthService;
  let signMock: jest.Mock;

  const mockConfig = {
    google: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      callbackUrl: 'http://localhost:3000/auth/google/callback',
    },
    jwt: { secret: 'test-secret' },
    allowedRedirectUris: [
      'vscode://eszlamczyk.beyond-the-panuozzo/auth',
      'http://localhost:3000/callback',
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: (signMock = jest.fn().mockReturnValue('mock-jwt-token')),
          },
        },
        { provide: authConfig.KEY, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateRedirectUri', () => {
    it('should return true for a whitelisted URI', () => {
      expect(
        service.validateRedirectUri(
          'vscode://eszlamczyk.beyond-the-panuozzo/auth',
        ),
      ).toBe(true);
    });

    it('should return true for another whitelisted URI', () => {
      expect(
        service.validateRedirectUri('http://localhost:3000/callback'),
      ).toBe(true);
    });

    it('should return false for an unknown URI', () => {
      expect(service.validateRedirectUri('http://evil.com/callback')).toBe(
        false,
      );
    });

    it('should return false for an empty string', () => {
      expect(service.validateRedirectUri('')).toBe(false);
    });
  });

  describe('encodeState / decodeState', () => {
    it('should roundtrip encode and decode state', () => {
      const redirectUri = 'vscode://eszlamczyk.beyond-the-panuozzo/auth';
      const clientState = 'some-random-state';

      const encoded = service.encodeState(redirectUri, clientState);
      const decoded = service.decodeState(encoded);

      expect(decoded.redirectUri).toBe(redirectUri);
      expect(decoded.clientState).toBe(clientState);
    });

    it('should handle undefined clientState', () => {
      const redirectUri = 'http://localhost:3000/callback';

      const encoded = service.encodeState(redirectUri);
      const decoded = service.decodeState(encoded);

      expect(decoded.redirectUri).toBe(redirectUri);
      expect(decoded.clientState).toBeUndefined();
    });
  });

  describe('generateJwt', () => {
    it('should call jwtService.sign with correct payload', () => {
      const user: GoogleUser = {
        googleId: '12345',
        email: 'test@example.com',
        displayName: 'Test User',
        photo: 'https://example.com/photo.jpg',
      };

      const token = service.generateJwt(user);

      expect(token).toBe('mock-jwt-token');
      expect(signMock).toHaveBeenCalledWith({
        sub: '12345',
        email: 'test@example.com',
        name: 'Test User',
      });
    });
  });
});
