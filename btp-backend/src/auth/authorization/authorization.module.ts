import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { authorizationConfig } from './authorization.config';
import { EmailDomainGuard } from './email-domain.guard';

@Module({
  imports: [ConfigModule.forFeature(authorizationConfig)],
  providers: [EmailDomainGuard],
  exports: [EmailDomainGuard, ConfigModule],
})
export class AuthorizationModule {}
