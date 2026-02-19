import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Actor } from '../../auth/authorization/actor';
import { OrderStatus } from '../order-status.enum';
import type { PanuozzoSize } from '../panuozzo-size.enum';
import { OrdersService } from './orders.service';
import { WishlistItem } from './wishlist.model';
import { WishlistRepositoryPort } from './wishlist-repository.port';

export interface CreateWishlistInput {
  rating: number;
  foodId: string;
  orderId: string;
  size: PanuozzoSize;
}

export interface UpdateWishlistInput {
  rating: number;
}

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepositoryPort,
    private readonly ordersService: OrdersService,
  ) {}

  async create(
    input: CreateWishlistInput,
    actor: Actor,
  ): Promise<WishlistItem> {
    await this.ensureOrderIsDraft(input.orderId);

    return this.wishlistRepository.create({
      rating: input.rating,
      foodId: input.foodId,
      userId: actor.userId,
      orderId: input.orderId,
      size: input.size,
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
    await this.ensureOrderIsDraft(item.orderId);
    return this.wishlistRepository.updateRating(id, input.rating);
  }

  async remove(id: string, actor: Actor): Promise<void> {
    const item = await this.wishlistRepository.findOne(id);
    if (!actor.isOwnerOf(item)) {
      throw new ForbiddenException(
        'You do not have permission to modify this wishlist item.',
      );
    }
    await this.ensureOrderIsDraft(item.orderId);
    return this.wishlistRepository.remove(id);
  }

  private async ensureOrderIsDraft(orderId: string): Promise<void> {
    if (!orderId) return;
    const order = await this.ordersService.findOne(orderId);
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException(
        'Wishlist items can only be modified on orders in Draft state.',
      );
    }
  }
}
