import { Injectable } from '@nestjs/common';
import { UserModel } from './user.model';
import { UsersRepositoryPort } from './users-repository.port';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepositoryPort) {}

  findAll(): Promise<UserModel[]> {
    return this.usersRepository.findAll();
  }

  async findOne(id: string): Promise<UserModel> {
    return this.usersRepository.findOne(id);
  }

  async findByEmail(email: string): Promise<UserModel> {
    return this.usersRepository.findByEmail(email);
  }
}
