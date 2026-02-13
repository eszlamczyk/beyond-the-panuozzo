import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { authenticationConfig } from './authentication.config';
import { RefreshToken } from './refresh-token.entity';

export interface RefreshTokenUser {
  googleId: string;
  email: string;
  displayName: string;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
    @Inject(authenticationConfig.KEY)
    private readonly config: ConfigType<typeof authenticationConfig>,
  ) {}

  /** Creates a new refresh token after initial OAuth login. Starts a new token family. */
  async createRefreshToken(user: RefreshTokenUser): Promise<string> {
    return this.issueToken(user, randomUUID());
  }

  /**
   * Validates a refresh token and rotates it (single-use token rotation).
   *
   * Each refresh token can only be used **once**. When used, it is marked as
   * revoked and a new token is issued in the same family. This forms a chain:
   *
   *   Login  → Token A (family "x")
   *   Refresh → Token B (family "x"), A marked revoked
   *   Refresh → Token C (family "x"), B marked revoked
   *
   * **Replay detection:** If a token that was already revoked (used) is
   * presented again, it means either the token was stolen or a network retry
   * delivered a duplicate request. In either case we cannot tell who holds
   * the latest valid token — the legitimate client or the attacker — so we
   * revoke *every* token in the family, forcing all parties to re-authenticate
   * via the full OAuth flow.
   */
  async rotateRefreshToken(
    rawToken: string,
  ): Promise<{ newRefreshToken: string; user: RefreshTokenUser }> {
    const hash = this.hashToken(rawToken);
    const existing = await this.repo.findOne({ where: { tokenHash: hash } });

    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    // A revoked token being reused is a strong signal of token theft.
    // Revoke the entire family so neither the attacker nor the original
    // client can continue using any token from this chain.
    if (existing.revoked) {
      await this.revokeFamily(existing.family);
      throw new UnauthorizedException(
        'Refresh token reuse detected. All sessions revoked.',
      );
    }

    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired.');
    }

    // Atomically mark the token as used. The WHERE clause ensures that only
    // one concurrent request can succeed; any racing request will see
    // affected === 0 and trigger family-wide revocation.
    const result = await this.repo.update(
      { tokenHash: hash, revoked: false },
      { revoked: true },
    );

    if (result.affected === 0) {
      // Another request already consumed this token — treat as replay.
      await this.revokeFamily(existing.family);
      throw new UnauthorizedException(
        'Refresh token reuse detected. All sessions revoked.',
      );
    }

    const user: RefreshTokenUser = {
      googleId: existing.googleId,
      email: existing.email,
      displayName: existing.displayName,
    };

    // Issue a successor token in the same family chain.
    const newRefreshToken = await this.issueToken(user, existing.family);
    return { newRefreshToken, user };
  }

  // TODO: Add a scheduled job to periodically purge expired/revoked rows, e.g.:
  //   DELETE FROM refresh_tokens WHERE expires_at < NOW() AND revoked = true

  /** Revokes all refresh tokens for a given Google ID (used on sign-out). */
  async revokeAllForUser(googleId: string): Promise<void> {
    await this.repo.update({ googleId, revoked: false }, { revoked: true });
  }

  /** Revokes every token in a rotation chain (replay detection). */
  private async revokeFamily(family: string): Promise<void> {
    await this.repo.update({ family, revoked: false }, { revoked: true });
  }

  private async issueToken(
    user: RefreshTokenUser,
    family: string,
  ): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + this.config.refreshToken.lifetimeDays,
    );

    const entity = this.repo.create({
      tokenHash: this.hashToken(rawToken),
      googleId: user.googleId,
      email: user.email,
      displayName: user.displayName,
      expiresAt,
      family,
    });
    await this.repo.save(entity);

    return rawToken;
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
