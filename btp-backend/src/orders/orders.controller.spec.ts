import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { Order } from './order.entity';
import { OrderStatus } from './order-status.enum';
import type { UpdateOrderDto } from './dto/update-order.dto';
import type { UserOrder } from './user-order.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
    addFoodToOrder: jest.fn(),
    removeFoodFromOrder: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', async () => {
    const dto: CreateOrderDto = { managerId: 'uuid' };
    const createSpy = jest
      .spyOn(service, 'create')
      .mockResolvedValue(mockOrder);
    const result = await controller.create(dto);
    expect(createSpy).toHaveBeenCalledWith(dto);
    expect(result.status).toBe(OrderStatus.DRAFT);
  });

  it('should call service.findOne', async () => {
    const findSpy = jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder);
    await controller.findOne('id');
    expect(findSpy).toHaveBeenCalledWith('id');
  });

  it('should call service.updateStatus', async () => {
    const dto: UpdateOrderDto = { status: 2 };
    const updateSpy = jest
      .spyOn(service, 'updateStatus')
      .mockResolvedValue({ ...mockOrder, status: 2 });
    const result = await controller.updateStatus('id', dto);
    expect(updateSpy).toHaveBeenCalledWith('id', dto);
    expect(result.status).toBe(OrderStatus.ORDERED);
  });

  it('should call service.remove', async () => {
    const removeSpy = jest.spyOn(service, 'remove').mockResolvedValue();
    await controller.remove('id');
    expect(removeSpy).toHaveBeenCalledWith('id');
  });

  it('should call service.addFoodToOrder', async () => {
    const dto = { foodId: 'food', userId: 'user' };
    const addFoodSpy = jest
      .spyOn(service, 'addFoodToOrder')
      .mockResolvedValue(dto as unknown as UserOrder);
    await controller.addFoodToOrder('orderId', dto);
    expect(addFoodSpy).toHaveBeenCalledWith('orderId', dto);
  });

  it('should call service.removeFoodFromOrder', async () => {
    const removeFoodSpy = jest
      .spyOn(service, 'removeFoodFromOrder')
      .mockResolvedValue();
    await controller.removeFoodFromOrder('itemId');
    expect(removeFoodSpy).toHaveBeenCalledWith('itemId');
  });
});
