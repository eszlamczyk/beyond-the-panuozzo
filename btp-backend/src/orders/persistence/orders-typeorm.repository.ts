import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '@btp/shared';
import { OrderModel } from '../domain/order.model';
import { OrdersRepositoryPort } from '../domain/orders-repository.port';
import { Order } from './order.entity';
import { OrderMapper } from './order.mapper';
import { User } from '../../users/persistence/user.entity';

const RELATIONS = ['manager', 'items', 'items.user', 'items.food'] as const;

@Injectable()
export class OrdersTypeOrmRepository extends OrdersRepositoryPort {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {
    super();
  }

  async findAll(): Promise<OrderModel[]> {
    const entities = await this.repo.find({ relations: [...RELATIONS] });
    return entities.map((entity) => OrderMapper.toDomain(entity));
  }

  async findOne(id: string): Promise<OrderModel> {
    const entity = await this.findEntityOrThrow(id);
    return OrderMapper.toDomain(entity);
  }

  async create(managerId: string): Promise<OrderModel> {
    const order = this.repo.create({
      status: OrderStatus.DRAFT,
      manager: { id: managerId } as User,
      items: [],
    });
    const saved = await this.repo.save(order);
    return this.findOne(saved.id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderModel> {
    const entity = await this.findEntityOrThrow(id);
    entity.status = status;
    await this.repo.save(entity);
    return OrderMapper.toDomain(entity);
  }

  async delete(id: string): Promise<OrderModel> {
    const entity = await this.findEntityOrThrow(id);
    const model = OrderMapper.toDomain(entity);
    await this.repo.remove(entity);
    return model;
  }

  private async findEntityOrThrow(id: string): Promise<Order> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: [...RELATIONS],
    });
    if (!entity) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return entity;
  }
}
