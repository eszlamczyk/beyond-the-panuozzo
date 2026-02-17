import type { PanuozzoSize } from '../panuozzo-size.enum';

export interface WishlistItem {
  id: string;
  rating: number;
  size: PanuozzoSize;
  userId: string;
  foodId: string;
  foodName?: string;
  orderId: string;
}
