import type { PanuozzoSize } from '@btp/shared';

export interface WishlistItem {
  id: string;
  rating: number;
  size: PanuozzoSize;
  userId: string;
  foodId: string;
  foodName?: string;
  orderId: string;
}
