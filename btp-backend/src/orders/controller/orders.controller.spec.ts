import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../domain/orders.service';
import { NotFoundException } from '@nestjs/common';
import type { OrderModel } from '../domain/order.model';
import { OrderStatus } from '../order-status.enum';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;
  const mockService = { findAll: jest.fn(), findOne: jest.fn() };
  const mockOrderId = 'order-uuid-123';
  const mockManagerId = 'manager-uuid-213';
  const mockOrder: OrderModel = {
    id: mockOrderId,
    status: OrderStatus.DRAFT,
    managerId: mockManagerId,
    items: [],
  };

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

  it('should call service.findOne and return a response DTO', async () => {
    const findSpy = jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder);
    const result = await controller.findOne('id');
    expect(findSpy).toHaveBeenCalledWith('id');
    expect(result.id).toBe(mockOrder.id);
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

  it('should call service.findAll and return response DTOs', async () => {
    const findSpy = jest
      .spyOn(service, 'findAll')
      .mockResolvedValue([mockOrder]);
    const result = await controller.findAll();
    expect(findSpy).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(mockOrder.id);
  });
});
