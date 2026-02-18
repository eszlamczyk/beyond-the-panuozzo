import type { UserModel } from './user.model';

export abstract class UsersRepositoryPort {
  abstract findOne(id: string): Promise<UserModel>;
  abstract findByEmail(email: string): Promise<UserModel>;
}
