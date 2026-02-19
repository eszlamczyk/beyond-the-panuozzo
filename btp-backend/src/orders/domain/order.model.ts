import type { OrderStatus } from '@btp/shared';
import type { OrderItemModel } from './order-item.model';

export interface OrderModel {
  id: string;
  status: OrderStatus;
  managerId: string;
  managerName?: string;
  items: OrderItemModel[];
}
