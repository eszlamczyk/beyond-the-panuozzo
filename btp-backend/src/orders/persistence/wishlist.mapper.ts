import type { WishlistItem } from '../domain/wishlist.model';
import type { WishlistEntity } from './wishlist.entity';

export class WishlistMapper {
  static toDomain(entity: WishlistEntity): WishlistItem {
    if (!entity.user) {
      throw new Error(
        `Missing loaded relation: user for WishlistEntity id=${entity.id}`,
      );
    }
    if (!entity.food) {
      throw new Error(
        `Missing loaded relation: food for WishlistEntity id=${entity.id}`,
      );
    }
    if (!entity.order) {
      throw new Error(
        `Missing loaded relation: order for WishlistEntity id=${entity.id}`,
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
