import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

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

  it('should call service.create', () => {
    const dto = { managerId: 'uuid' };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findOne', () => {
    controller.findOne('id');
    expect(service.findOne).toHaveBeenCalledWith('id');
  });

  it('should call service.updateStatus', () => {
    const dto = { status: 1 } as any;
    controller.updateStatus('id', dto);
    expect(service.updateStatus).toHaveBeenCalledWith('id', dto);
  });

  it('should call service.remove', () => {
    controller.remove('id');
    expect(service.remove).toHaveBeenCalledWith('id');
  });

  it('should call service.addFoodToOrder', () => {
    const dto = { foodId: 'food', userId: 'user' };
    controller.addFoodToOrder('orderId', dto);
    expect(service.addFoodToOrder).toHaveBeenCalledWith('orderId', dto);
  });

  it('should call service.removeFoodFromOrder', () => {
    controller.removeFoodFromOrder('itemId');
    expect(service.removeFoodFromOrder).toHaveBeenCalledWith('itemId');
  });
});
