import type { WishlistItem } from '../domain/wishlist.model';
import type { WishlistEntity } from './wishlist.entity';

export class WishlistMapper {
  static toDomain(entity: WishlistEntity): WishlistItem {
    return {
      id: entity.id,
      rating: entity.rating,
      size: entity.size,
      userId: entity.user?.id,
      foodId: entity.food?.id,
      foodName: entity.food?.name,
      orderId: entity.order?.id,
    };
  }
}
