import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NotFoundException } from '@nestjs/common';
import type { Order } from './order.entity';
import { OrderStatus } from './order-status.enum';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockOrderId = 'order-uuid-123';
  const mockManagerId = 'manager-uuid-213';

  const mockOrder: Order = {
    id: mockOrderId,
    status: OrderStatus.DRAFT,
    manager: { id: mockManagerId },
    items: [],
    wishlists: [],
  } as unknown as Order;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.findOne', async () => {
    const findSpy = jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder);
    await controller.findOne('id');
    expect(findSpy).toHaveBeenCalledWith('id');
  });

  it('should throw NotFoundException (404) when order not found', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockRejectedValue(
        new NotFoundException(`Order with ID "${mockOrderId}" not found`),
      );
    await expect(controller.findOne(mockOrderId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
