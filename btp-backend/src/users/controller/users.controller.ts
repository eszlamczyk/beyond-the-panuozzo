import { Controller, Get, Param } from '@nestjs/common';
import { Authenticated } from '../../authentication/authenticated.decorator';
import { UsersService } from '../domain/users.service';
import { UserResponseDto } from './dto/user-response.dto';

@Authenticated()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return UserResponseDto.fromDomain(user);
  }
}
