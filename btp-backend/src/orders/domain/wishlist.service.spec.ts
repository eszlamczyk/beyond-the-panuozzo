import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { WishlistRepositoryPort } from './wishlist-repository.port';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PanuozzoSize } from '../panuozzo-size.enum';
import { OrderStatus } from '../order-status.enum';
import type { WishlistItem } from './wishlist.model';
import { Actor } from '../../auth/authorization/actor';
import { OrdersService } from './orders.service';

const mockRepository: jest.Mocked<WishlistRepositoryPort> = {
  create: jest.fn(),
  findOne: jest.fn(),
  findByOrder: jest.fn(),
  updateRating: jest.fn(),
  remove: jest.fn(),
};

const mockOrdersService: jest.Mocked<Pick<OrdersService, 'findOne'>> = {
  findOne: jest.fn(),
};

describe('WishlistService', () => {
  let service: WishlistService;

  const mockUserId = 'user-uuid-123';
  const mockFoodId = 'food-uuid-456';
  const mockWishlistId = 'wishlist-uuid-789';
  const owner = new Actor(mockUserId);
  const otherUser = new Actor('other-user-id');

  const mockWishlistItem: WishlistItem = {
    id: mockWishlistId,
    rating: 5,
    size: PanuozzoSize.HALF,
    userId: mockUserId,
    foodId: mockFoodId,
    orderId: 'order-uuid-101',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: WishlistRepositoryPort,
          useValue: mockRepository,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createInput = {
      foodId: mockFoodId,
      rating: 5,
      orderId: 'order-uuid-101',
      size: PanuozzoSize.HALF,
    };

    it('should create a new wishlist item for the actor when order is in Draft state', async () => {
      mockOrdersService.findOne.mockResolvedValue({
        id: 'order-uuid-101',
        status: OrderStatus.DRAFT,
        managerId: 'manager-1',
        items: [],
      });
      mockRepository.create.mockResolvedValue(mockWishlistItem);

      const result = await service.create(createInput, owner);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockOrdersService.findOne).toHaveBeenCalledWith('order-uuid-101');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.create).toHaveBeenCalledWith({
        rating: 5,
        foodId: mockFoodId,
        userId: mockUserId,
        orderId: 'order-uuid-101',
        size: PanuozzoSize.HALF,
      });
      expect(result).toEqual(mockWishlistItem);
    });

    it('should throw BadRequestException when order is not in Draft state', async () => {
      mockOrdersService.findOne.mockResolvedValue({
        id: 'order-uuid-101',
        status: OrderStatus.ORDERED,
        managerId: 'manager-1',
        items: [],
      });

      await expect(service.create(createInput, owner)).rejects.toThrow(
        BadRequestException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when order is in TO_ORDER state', async () => {
      mockOrdersService.findOne.mockResolvedValue({
        id: 'order-uuid-101',
        status: OrderStatus.TO_ORDER,
        managerId: 'manager-1',
        items: [],
      });

      await expect(service.create(createInput, owner)).rejects.toThrow(
        BadRequestException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when order is in EATEN state', async () => {
      mockOrdersService.findOne.mockResolvedValue({
        id: 'order-uuid-101',
        status: OrderStatus.EATEN,
        managerId: 'manager-1',
        items: [],
      });

      await expect(service.create(createInput, owner)).rejects.toThrow(
        BadRequestException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should allow duplicate wishlist items for the same user and food', async () => {
      const duplicateItem = { ...mockWishlistItem, id: 'wishlist-uuid-dup' };
      mockOrdersService.findOne.mockResolvedValue({
        id: 'order-uuid-101',
        status: OrderStatus.DRAFT,
        managerId: 'manager-1',
        items: [],
      });
      mockRepository.create.mockResolvedValue(duplicateItem);

      const result = await service.create(createInput, owner);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toEqual(duplicateItem);
    });
  });

  describe('findByOrder', () => {
    it('should return wishlist items for an order', async () => {
      mockRepository.findByOrder.mockResolvedValue([mockWishlistItem]);

      const result = await service.findByOrder('order-uuid-101');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.findByOrder).toHaveBeenCalledWith('order-uuid-101');
      expect(result).toEqual([mockWishlistItem]);
    });
  });

  describe('updateRating', () => {
    it('should update the rating of a wishlist item owned by the actor', async () => {
      const updatedItem = { ...mockWishlistItem, rating: 4 };
      mockRepository.findOne.mockResolvedValue(mockWishlistItem);
      mockOrdersService.findOne.mockResolvedValue({
        id: 'order-uuid-101',
        status: OrderStatus.DRAFT,
        managerId: 'manager-1',
        items: [],
      });
      mockRepository.updateRating.mockResolvedValue(updatedItem);

      const result = await service.updateRating(
        mockWishlistId,
        { rating: 4 },
        owner,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.updateRating).toHaveBeenCalledWith(
        mockWishlistId,
        4,
      );
      expect(result.rating).toBe(4);
    });

    it('should throw BadRequestException when order is not in Draft state', async () => {
      mockRepository.findOne.mockResolvedValue(mockWishlistItem);
      mockOrdersService.findOne.mockResolvedValue({
        id: 'order-uuid-101',
        status: OrderStatus.ORDERED,
        managerId: 'manager-1',
        items: [],
      });

      await expect(
        service.updateRating(mockWishlistId, { rating: 4 }, owner),
      ).rejects.toThrow(BadRequestException);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.updateRating).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when actor does not own the item', async () => {
      mockRepository.findOne.mockResolvedValue(mockWishlistItem);

      await expect(
        service.updateRating(mockWishlistId, { rating: 4 }, otherUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should propagate NotFoundException from repository', async () => {
      mockRepository.findOne.mockRejectedValue(
        new NotFoundException(
          `Wishlist item with ID "${mockWishlistId}" not found`,
        ),
      );

      await expect(
        service.updateRating(mockWishlistId, { rating: 4 }, owner),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a wishlist item owned by the actor', async () => {
      mockRepository.findOne.mockResolvedValue(mockWishlistItem);
      mockOrdersService.findOne.mockResolvedValue({
        id: 'order-uuid-101',
        status: OrderStatus.DRAFT,
        managerId: 'manager-1',
        items: [],
      });
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(mockWishlistId, owner);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.remove).toHaveBeenCalledWith(mockWishlistId);
    });

    it('should throw BadRequestException when order is not in Draft state', async () => {
      mockRepository.findOne.mockResolvedValue(mockWishlistItem);
      mockOrdersService.findOne.mockResolvedValue({
        id: 'order-uuid-101',
        status: OrderStatus.TO_ORDER,
        managerId: 'manager-1',
        items: [],
      });

      await expect(service.remove(mockWishlistId, owner)).rejects.toThrow(
        BadRequestException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when actor does not own the item', async () => {
      mockRepository.findOne.mockResolvedValue(mockWishlistItem);

      await expect(service.remove(mockWishlistId, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should propagate NotFoundException from repository', async () => {
      mockRepository.findOne.mockRejectedValue(
        new NotFoundException(
          `Wishlist item with ID "${mockWishlistId}" not found`,
        ),
      );

      await expect(service.remove(mockWishlistId, owner)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
