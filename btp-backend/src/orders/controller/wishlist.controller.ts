import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Authenticated } from '../../auth/authenticated.decorator';
import { jwtPayloadSchema } from '../../auth/authentication/jwt-payload.schema';
import { Actor } from '../../auth/authorization/actor';
import { UsersService } from '../../users/domain/users.service';
import { CreateWishlistRequestDto } from './dto/create-wishlist-request.dto';
import { UpdateWishlistRequestDto } from './dto/update-wishlist-request.dto';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { WishlistService } from '../domain/wishlist.service';

@Authenticated()
@ApiTags('Orders > Wishlists')
@Controller('orders/:orderId/wishlists')
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(
    @Param('orderId') orderId: string,
    @Body() dto: CreateWishlistRequestDto,
    @Req() req: Request,
  ): Promise<WishlistResponseDto> {
    const actor = await this.resolveActor(req);
    const item = await this.wishlistService.create({ ...dto, orderId }, actor);
    return WishlistResponseDto.fromDomain(item);
  }

  @Get()
  async findByOrder(
    @Param('orderId') orderId: string,
  ): Promise<WishlistResponseDto[]> {
    const items = await this.wishlistService.findByOrder(orderId);
    return items.map((item) => WishlistResponseDto.fromDomain(item));
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWishlistRequestDto,
    @Req() req: Request,
  ): Promise<WishlistResponseDto> {
    const actor = await this.resolveActor(req);
    const item = await this.wishlistService.updateRating(id, dto, actor);
    return WishlistResponseDto.fromDomain(item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const actor = await this.resolveActor(req);
    return this.wishlistService.remove(id, actor);
  }

  private async resolveActor(req: Request): Promise<Actor> {
    const payload = jwtPayloadSchema.safeParse(req.user);
    if (!payload.success) {
      throw new UnauthorizedException('Invalid token payload.');
    }
    const user = await this.usersService.findByEmail(payload.data.email);
    return new Actor(user.id);
  }
}
