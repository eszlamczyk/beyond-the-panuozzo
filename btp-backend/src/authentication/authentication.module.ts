import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthorizationModule } from '../authorization/authorization.module';
import { authenticationConfig } from './authentication.config';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { GoogleStrategy } from './google.strategy';
import { JwtAuthenticationGuard } from './jwt-authentication.guard';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forFeature(authenticationConfig),
    PassportModule,
    AuthorizationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authenticationConfig)],
      inject: [authenticationConfig.KEY],
      useFactory: (config: ConfigType<typeof authenticationConfig>) => ({
        secret: config.jwt.secret,
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, GoogleStrategy, JwtStrategy, JwtAuthenticationGuard],
  exports: [JwtAuthenticationGuard],
})
export class AuthenticationModule {}
