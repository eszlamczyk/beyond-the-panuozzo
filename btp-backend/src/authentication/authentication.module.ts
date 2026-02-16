import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationModule } from '../authorization/authorization.module';
import { authenticationConfig } from './authentication.config';
import { AuthenticationController } from './authentication.controller';
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
    AuthorizationModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
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
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    RefreshTokenService,
    GoogleStrategy,
    JwtStrategy,
    JwtAuthenticationGuard,
  ],
  exports: [JwtAuthenticationGuard],
})
export class AuthenticationModule {}
