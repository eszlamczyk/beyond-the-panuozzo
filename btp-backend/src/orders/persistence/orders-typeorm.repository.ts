import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderModel } from '../domain/order.model';
import { OrdersRepositoryPort } from '../domain/orders-repository.port';
import { Order } from './order.entity';
import { OrderMapper } from './order.mapper';

@Injectable()
export class OrdersTypeOrmRepository extends OrdersRepositoryPort {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {
    super();
  }

  async findAll(): Promise<OrderModel[]> {
    const entities = await this.repo.find({
      relations: ['manager', 'items', 'items.user', 'items.food'],
    });
    return entities.map((entity) => OrderMapper.toDomain(entity));
  }

  async findOne(id: string): Promise<OrderModel> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['manager', 'items', 'items.user', 'items.food'],
    });
    if (!entity) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return OrderMapper.toDomain(entity);
  }
}
