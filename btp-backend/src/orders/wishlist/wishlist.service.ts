import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    const { rating, userId, foodId, orderId, size } = createWishlistDto;

    const wishlistItem = this.wishlistRepository.create({
      rating,
      size,
      user: { id: userId },
      food: { id: foodId },
      order: { id: orderId },
    });

    return this.wishlistRepository.save(wishlistItem);
  }

  async findByOrder(orderId: string): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { order: { id: orderId } },
      relations: ['food'],
    });
  }

  async updateRating(
    id: string,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlistItem = await this.wishlistRepository.preload({
      id,
      ...updateWishlistDto,
    });
    if (!wishlistItem) {
      throw new NotFoundException(`Wishlist item with ID "${id}" not found`);
    }
    return this.wishlistRepository.save(wishlistItem);
  }

  async remove(id: string): Promise<void> {
    const result = await this.wishlistRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Wishlist item with ID "${id}" not found`);
    }
  }
}
