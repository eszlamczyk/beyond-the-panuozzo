import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddFoodToOrderDto } from './dto/add-food-to-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './order.entity';
import { UserOrder } from './user-order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(UserOrder)
    private readonly userOrdersRepository: Repository<UserOrder>,
  ) {}

  create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create({
      manager: { id: createOrderDto.managerId },
    });
    return this.ordersRepository.save(order);
  }

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['manager', 'items', 'items.user', 'items.food'],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['manager', 'items', 'items.user', 'items.food'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return order;
  }

  async updateStatus(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.ordersRepository.preload({
      id,
      status: updateOrderDto.status,
    });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ordersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
  }

  async addFoodToOrder(
    orderId: string,
    addFoodToOrderDto: AddFoodToOrderDto,
  ): Promise<UserOrder> {
    const order = await this.findOne(orderId);
    const userOrder = this.userOrdersRepository.create({
      order: order,
      food: { id: addFoodToOrderDto.foodId },
      user: { id: addFoodToOrderDto.userId },
    });
    return this.userOrdersRepository.save(userOrder);
  }

  async removeFoodFromOrder(itemId: string): Promise<void> {
    const result = await this.userOrdersRepository.delete(itemId);
    if (result.affected === 0) {
      throw new NotFoundException(
        `UserOrder item with ID "${itemId}" not found`,
      );
    }
  }
}
