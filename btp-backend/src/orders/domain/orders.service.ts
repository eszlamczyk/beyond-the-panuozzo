import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@btp/shared';
import { OrderModel } from './order.model';
import { OrdersRepositoryPort } from './orders-repository.port';
import { OrderEventsService } from './order-events.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepositoryPort,
    private readonly orderEventsService: OrderEventsService,
  ) {}

  findAll(): Promise<OrderModel[]> {
    return this.ordersRepository.findAll();
  }

  findOne(id: string): Promise<OrderModel> {
    return this.ordersRepository.findOne(id);
  }

  async create(managerId: string): Promise<OrderModel> {
    const order = await this.ordersRepository.create(managerId);
    this.orderEventsService.emit({ type: 'created', order });
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderModel> {
    const order = await this.ordersRepository.updateStatus(id, status);
    this.orderEventsService.emit({ type: 'updated', order });
    return order;
  }

  async delete(id: string): Promise<OrderModel> {
    const order = await this.ordersRepository.delete(id);
    this.orderEventsService.emit({ type: 'deleted', order });
    return order;
  }
}
