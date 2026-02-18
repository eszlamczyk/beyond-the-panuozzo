import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from './persistence/user.entity';
import { UsersController } from './controller/users.controller';
import { UsersService } from './domain/users.service';
import { UsersRepositoryPort } from './domain/users-repository.port';
import { UsersTypeOrmRepository } from './persistence/users-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepositoryPort,
      useClass: UsersTypeOrmRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
