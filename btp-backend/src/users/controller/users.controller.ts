import { Controller, Get, Param } from '@nestjs/common';
import { Authenticated } from '../../auth/authenticated.decorator';
import { UsersService } from '../domain/users.service';
import { UserResponseDto } from './dto/user-response.dto';

@Authenticated()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Authenticated('admin')
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => UserResponseDto.fromDomain(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return UserResponseDto.fromDomain(user);
  }
}
