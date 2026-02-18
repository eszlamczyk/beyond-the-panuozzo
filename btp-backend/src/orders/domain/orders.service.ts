import { Injectable } from '@nestjs/common';
import { OrderModel } from './order.model';
import { OrdersRepositoryPort } from './orders-repository.port';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepositoryPort) {}

  findAll(): Promise<OrderModel[]> {
    return this.ordersRepository.findAll();
  }

  findOne(id: string): Promise<OrderModel> {
    return this.ordersRepository.findOne(id);
  }
}
