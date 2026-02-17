import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepositoryPort } from './orders-repository.port';
import { OrderStatus } from '../order-status.enum';
import type { OrderModel } from './order.model';

const mockRepository: jest.Mocked<OrdersRepositoryPort> = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrder: OrderModel = {
    id: 'uuid',
    status: OrderStatus.DRAFT,
    managerId: 'mgr',
    items: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      mockRepository.findAll.mockResolvedValue([mockOrder]);
      expect(await service.findAll()).toEqual([mockOrder]);
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      mockRepository.findOne.mockResolvedValue(mockOrder);
      expect(await service.findOne('uuid')).toEqual(mockOrder);
    });

    it('should propagate NotFoundException from repository', async () => {
      mockRepository.findOne.mockRejectedValue(
        new NotFoundException('Order with ID "uuid" not found'),
      );
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
