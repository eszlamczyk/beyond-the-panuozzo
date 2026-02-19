import type { UserModel } from './user.model';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export abstract class UsersRepositoryPort {
  abstract findAll(
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<UserModel>>;
  abstract findOne(id: string): Promise<UserModel>;
  abstract findByEmail(email: string): Promise<UserModel>;
}
