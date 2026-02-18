import { ApiProperty } from '@nestjs/swagger';
import { UserModel } from '../../domain/user.model';

export class UserResponseDto {
  @ApiProperty({ description: 'User unique identifier' })
  id!: string;

  @ApiProperty({ description: 'User first name' })
  firstName!: string;

  @ApiProperty({ description: 'User last name' })
  lastName!: string;

  @ApiProperty({ description: 'User email address' })
  email!: string;

  @ApiProperty({ description: 'User phone number' })
  phoneNumber!: string;

  static fromDomain(item: UserModel): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = item.id;
    dto.firstName = item.firstName;
    dto.lastName = item.lastName;
    dto.email = item.email;
    dto.phoneNumber = item.phoneNumber;
    return dto;
  }
}
