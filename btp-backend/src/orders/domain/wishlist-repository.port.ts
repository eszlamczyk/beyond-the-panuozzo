import type { WishlistItem } from './wishlist.model';

export abstract class WishlistRepositoryPort {
  abstract create(
    item: Omit<WishlistItem, 'id' | 'foodName'>,
  ): Promise<WishlistItem>;

  abstract findOne(id: string): Promise<WishlistItem>;

  abstract findByOrder(orderId: string): Promise<WishlistItem[]>;

  abstract updateRating(id: string, rating: number): Promise<WishlistItem>;

  abstract remove(id: string): Promise<void>;
}
