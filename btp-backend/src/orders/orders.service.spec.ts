import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { OrderStatus } from './order-status.enum';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Partial<Record<keyof Repository<Order>, jest.Mock>>;

  const mockOrder = {
    id: 'order-uuid',
    manager: { id: 'manager-uuid' },
    status: OrderStatus.DRAFT,
  };

  beforeEach(async () => {
    orderRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find an order', async () => {
      orderRepository.findOne!.mockResolvedValue(mockOrder);
      expect(await service.findOne('order-uuid')).toEqual(mockOrder);
    });
    it('should throw NotFoundException', async () => {
      orderRepository.findOne!.mockResolvedValue(null);
      await expect(service.findOne('order-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
