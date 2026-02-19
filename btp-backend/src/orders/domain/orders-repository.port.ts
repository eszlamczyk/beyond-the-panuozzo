import type { OrderStatus } from '../order-status.enum';
import type { OrderModel } from './order.model';

export abstract class OrdersRepositoryPort {
  abstract findAll(): Promise<OrderModel[]>;
  abstract findOne(id: string): Promise<OrderModel>;
  abstract create(managerId: string): Promise<OrderModel>;
  abstract updateStatus(id: string, status: OrderStatus): Promise<OrderModel>;
  abstract delete(id: string): Promise<OrderModel>;
}
