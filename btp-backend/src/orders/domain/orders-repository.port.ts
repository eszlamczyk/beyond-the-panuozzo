import type { OrderModel } from './order.model';

export abstract class OrdersRepositoryPort {
  abstract findAll(): Promise<OrderModel[]>;
  abstract findOne(id: string): Promise<OrderModel>;
}
