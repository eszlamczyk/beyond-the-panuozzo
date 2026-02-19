import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { authenticationConfig } from './authentication.config';
import { AuthenticationService } from './authentication.service';
import { GoogleStrategy } from './google.strategy';
import { JwtAuthenticationGuard } from './jwt-authentication.guard';
import { JwtStrategy } from './jwt.strategy';
import { RefreshToken } from './refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [
    ConfigModule.forFeature(authenticationConfig),
    PassportModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authenticationConfig)],
      inject: [authenticationConfig.KEY],
      useFactory: (config: ConfigType<typeof authenticationConfig>) => ({
        secret: config.jwt.secret,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [
    AuthenticationService,
    RefreshTokenService,
    GoogleStrategy,
    JwtStrategy,
    JwtAuthenticationGuard,
  ],
  exports: [
    ConfigModule.forFeature(authenticationConfig),
    JwtAuthenticationGuard,
    AuthenticationService,
    RefreshTokenService,
  ],
})
export class AuthenticationModule {}
