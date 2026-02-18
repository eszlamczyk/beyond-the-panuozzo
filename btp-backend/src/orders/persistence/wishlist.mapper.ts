import type { WishlistItem } from '../domain/wishlist.model';
import type { Wishlist } from './wishlist.entity';

export class WishlistMapper {
  static toDomain(entity: Wishlist): WishlistItem {
    if (!entity.user) {
      throw new Error(
        `Missing loaded relation: user for Wishlist id=${entity.id}`,
      );
    }
    if (!entity.food) {
      throw new Error(
        `Missing loaded relation: food for Wishlist id=${entity.id}`,
      );
    }
    if (!entity.order) {
      throw new Error(
        `Missing loaded relation: order for Wishlist id=${entity.id}`,
      );
    }

    return {
      id: entity.id,
      rating: entity.rating,
      size: entity.size,
      userId: entity.user.id,
      foodId: entity.food.id,
      foodName: entity.food.name,
      orderId: entity.order.id,
    };
  }
}
