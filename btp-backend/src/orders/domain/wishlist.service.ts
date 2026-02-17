import { Injectable } from '@nestjs/common';
import { WishlistItem } from './wishlist.model';
import { WishlistRepositoryPort } from './wishlist-repository.port';

export interface CreateWishlistInput {
  rating: number;
  foodId: string;
  userId: string;
  orderId: string;
  size: string;
}

export interface UpdateWishlistInput {
  rating: number;
}

@Injectable()
export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepositoryPort) {}

  async create(input: CreateWishlistInput): Promise<WishlistItem> {
    return this.wishlistRepository.create({
      rating: input.rating,
      foodId: input.foodId,
      userId: input.userId,
      orderId: input.orderId,
      size: input.size as WishlistItem['size'],
    });
  }

  async findByOrder(orderId: string): Promise<WishlistItem[]> {
    return this.wishlistRepository.findByOrder(orderId);
  }

  async updateRating(
    id: string,
    input: UpdateWishlistInput,
  ): Promise<WishlistItem> {
    return this.wishlistRepository.updateRating(id, input.rating);
  }

  async remove(id: string): Promise<void> {
    return this.wishlistRepository.remove(id);
  }
}
