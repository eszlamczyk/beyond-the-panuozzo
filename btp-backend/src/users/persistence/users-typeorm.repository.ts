import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModel } from '../domain/user.model';
import { UsersRepositoryPort } from '../domain/users-repository.port';
import { User } from './user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UsersTypeOrmRepository extends UsersRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super();
  }

  async findAll(): Promise<UserModel[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => UserMapper.toDomain(user));
  }

  async findOne(id: string): Promise<UserModel> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<UserModel> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserMapper.toDomain(user);
  }
}
