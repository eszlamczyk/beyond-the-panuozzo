import { ForbiddenException, Injectable } from '@nestjs/common';
import { Actor } from '../../domain/actor';
import { WishlistItem } from './wishlist.model';
import { WishlistRepositoryPort } from './wishlist-repository.port';

export interface CreateWishlistInput {
  rating: number;
  foodId: string;
  orderId: string;
  size: string;
}

export interface UpdateWishlistInput {
  rating: number;
}

@Injectable()
export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepositoryPort) {}

  async create(
    input: CreateWishlistInput,
    actor: Actor,
  ): Promise<WishlistItem> {
    return this.wishlistRepository.create({
      rating: input.rating,
      foodId: input.foodId,
      userId: actor.userId,
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
    actor: Actor,
  ): Promise<WishlistItem> {
    const item = await this.wishlistRepository.findOne(id);
    if (!actor.isOwnerOf(item)) {
      throw new ForbiddenException(
        'You do not have permission to modify this wishlist item.',
      );
    }
    return this.wishlistRepository.updateRating(id, input.rating);
  }

  async remove(id: string, actor: Actor): Promise<void> {
    const item = await this.wishlistRepository.findOne(id);
    if (!actor.isOwnerOf(item)) {
      throw new ForbiddenException(
        'You do not have permission to modify this wishlist item.',
      );
    }
    return this.wishlistRepository.remove(id);
  }
}
