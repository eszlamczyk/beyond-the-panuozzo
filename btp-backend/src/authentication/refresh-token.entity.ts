import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** SHA-256 hex digest of the opaque token sent to the client. */
  @Index({ unique: true })
  @Column()
  tokenHash!: string;

  /** Google ID of the user (matches JWT `sub` claim). */
  @Index()
  @Column()
  googleId!: string;

  @Column()
  email!: string;

  @Column()
  displayName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  /** Set to `true` when the token has been used (rotation) or explicitly revoked. */
  @Column({ default: false })
  revoked!: boolean;

  /**
   * Token family ID. All tokens in the same rotation chain share this value.
   * If a revoked token is reused, all tokens in the family are revoked
   * (replay detection).
   */
  @Index()
  @Column()
  family!: string;
}
