import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';
import { UserOrder } from './user-order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './order-status.enum';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Partial<Record<keyof Repository<Order>, jest.Mock>>;
  let userOrderRepository: Partial<Record<keyof Repository<UserOrder>, jest.Mock>>;

  const mockOrder = {
    id: 'order-uuid',
    manager: { id: 'manager-uuid' },
    status: OrderStatus.DRAFT,
  };
  const mockUserOrder = { id: 'item-uuid' };

  beforeEach(async () => {
    orderRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };
    userOrderRepository = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepository },
        { provide: getRepositoryToken(UserOrder), useValue: userOrderRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const createDto: CreateOrderDto = { managerId: 'manager-uuid' };
      orderRepository.create!.mockReturnValue(mockOrder);
      orderRepository.save!.mockResolvedValue(mockOrder);

      expect(await service.create(createDto)).toEqual(mockOrder);
    });
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

  describe('addFoodToOrder', () => {
    it('should add an item to an order', async () => {
      const dto = { foodId: 'food-uuid', userId: 'user-uuid' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder as any);
      userOrderRepository.create!.mockReturnValue(mockUserOrder);
      userOrderRepository.save!.mockResolvedValue(mockUserOrder);

      expect(await service.addFoodToOrder('order-uuid', dto)).toEqual(
        mockUserOrder,
      );
    });
  });

  describe('removeFoodFromOrder', () => {
    it('should remove an item from an order', async () => {
      userOrderRepository.delete!.mockResolvedValue({ affected: 1 });
      await service.removeFoodFromOrder('item-uuid');
      expect(userOrderRepository.delete).toHaveBeenCalledWith('item-uuid');
    });
  });
});
