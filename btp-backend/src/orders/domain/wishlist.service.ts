import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Actor } from '../../auth/authorization/actor';
import { OrderStatus } from '../order-status.enum';
import type { PanuozzoSize } from '../panuozzo-size.enum';
import { OrderEventsService } from './order-events.service';
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
    private readonly orderEventsService: OrderEventsService,
  ) {}

  async create(
    input: CreateWishlistInput,
    actor: Actor,
  ): Promise<WishlistItem> {
    await this.ensureOrderIsDraft(input.orderId);

    const item = await this.wishlistRepository.create({
      rating: input.rating,
      foodId: input.foodId,
      userId: actor.userId,
      orderId: input.orderId,
      size: input.size,
    });
    await this.emitOrderUpdated(input.orderId);
    return item;
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
    const updated = await this.wishlistRepository.updateRating(id, input.rating);
    await this.emitOrderUpdated(item.orderId);
    return updated;
  }

  async remove(id: string, actor: Actor): Promise<void> {
    const item = await this.wishlistRepository.findOne(id);
    if (!actor.isOwnerOf(item)) {
      throw new ForbiddenException(
        'You do not have permission to modify this wishlist item.',
      );
    }
    await this.ensureOrderIsDraft(item.orderId);
    await this.wishlistRepository.remove(id);
    await this.emitOrderUpdated(item.orderId);
  }

  private async emitOrderUpdated(orderId: string): Promise<void> {
    const order = await this.ordersService.findOne(orderId);
    this.orderEventsService.emit({ type: 'updated', order });
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
