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
} from '@nestjs/common';
import { CreateWishlistRequestDto } from './dto/create-wishlist-request.dto';
import { UpdateWishlistRequestDto } from './dto/update-wishlist-request.dto';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { WishlistService } from '../domain/wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  async create(
    @Body() dto: CreateWishlistRequestDto,
  ): Promise<WishlistResponseDto> {
    const item = await this.wishlistService.create(dto);
    return WishlistResponseDto.fromDomain(item);
  }

  @Get('order/:orderId')
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
  ): Promise<WishlistResponseDto> {
    const item = await this.wishlistService.updateRating(id, dto);
    return WishlistResponseDto.fromDomain(item);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.wishlistService.remove(id);
  }
}
