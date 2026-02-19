import type { UserModel } from '../domain/user.model';
import type { User } from './user.entity';

export class UserMapper {
  static toDomain(entity: User): UserModel {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
    };
  }
}
