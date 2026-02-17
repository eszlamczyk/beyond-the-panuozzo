import type { PanuozzoSize } from '../panuozzo-size.enum';

export interface OrderItemModel {
  id: string;
  userId: string;
  userName?: string;
  foodId: string;
  foodName?: string;
  size: PanuozzoSize;
}
