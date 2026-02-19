import type { PanuozzoSize } from '@btp/shared';

export interface OrderItemModel {
  id: string;
  userId: string;
  userName?: string;
  foodId: string;
  foodName?: string;
  size: PanuozzoSize;
}
