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
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  create(@Body() createWishlistDto: CreateWishlistDto) {
    return this.wishlistService.create(createWishlistDto);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.wishlistService.findByOrder(orderId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.wishlistService.findByUser(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistService.updateRating(id, updateWishlistDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.wishlistService.remove(id);
  }
}
