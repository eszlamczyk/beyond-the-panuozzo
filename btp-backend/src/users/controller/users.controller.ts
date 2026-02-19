import { Controller, Get, Param, Query, SetMetadata } from '@nestjs/common';
import { Authenticated } from '../../auth/authenticated.decorator';
import { REQUIRED_CAPABILITY_KEY } from '../../auth/authorization/capability.guard';
import { UsersService } from '../domain/users.service';
import { UserResponseDto } from './dto/user-response.dto';

@Authenticated()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SetMetadata(REQUIRED_CAPABILITY_KEY, 'admin')
  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const result = await this.usersService.findAll(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
    return {
      ...result,
      items: result.items.map((user) => UserResponseDto.fromDomain(user)),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return UserResponseDto.fromDomain(user);
  }
}
