import { Module } from '@nestjs/common';
import { seconds, ThrottlerModule } from '@nestjs/throttler';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    AuthenticationModule,
    AuthorizationModule,
    ThrottlerModule.forRoot([{ ttl: seconds(60), limit: 10 }]),
  ],
  controllers: [AuthController],
  exports: [AuthenticationModule, AuthorizationModule],
})
export class AuthModule {}
