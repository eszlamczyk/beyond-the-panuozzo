import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepositoryPort } from './orders-repository.port';
import { OrderEventsService } from './order-events.service';
import { OrderStatus } from '@btp/shared';
import type { OrderModel } from './order.model';

const mockRepository: jest.Mocked<OrdersRepositoryPort> = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
};

const mockEventsService: jest.Mocked<Pick<OrderEventsService, 'emit'>> = {
  emit: jest.fn(),
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
        {
          provide: OrderEventsService,
          useValue: mockEventsService,
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

  describe('create', () => {
    it('should create an order and emit a created event', async () => {
      mockRepository.create.mockResolvedValue(mockOrder);
      const result = await service.create('mgr');
      expect(result).toEqual(mockOrder);
      expect(mockEventsService.emit).toHaveBeenCalledWith({
        type: 'created',
        order: mockOrder,
      });
    });
  });

  describe('updateStatus', () => {
    it('should update status and emit an updated event', async () => {
      const updated = { ...mockOrder, status: OrderStatus.ORDERED };
      mockRepository.updateStatus.mockResolvedValue(updated);
      const result = await service.updateStatus('uuid', OrderStatus.ORDERED);
      expect(result).toEqual(updated);
      expect(mockEventsService.emit).toHaveBeenCalledWith({
        type: 'updated',
        order: updated,
      });
    });
  });

  describe('delete', () => {
    it('should delete an order and emit a deleted event', async () => {
      mockRepository.delete.mockResolvedValue(mockOrder);
      const result = await service.delete('uuid');
      expect(result).toEqual(mockOrder);
      expect(mockEventsService.emit).toHaveBeenCalledWith({
        type: 'deleted',
        order: mockOrder,
      });
    });
  });
});
