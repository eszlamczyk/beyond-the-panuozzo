import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { WishlistRepositoryPort } from './wishlist-repository.port';
import { NotFoundException } from '@nestjs/common';
import { PanuozzoSize } from '../panuozzo-size.enum';
import type { WishlistItem } from './wishlist.model';

const mockRepository: jest.Mocked<WishlistRepositoryPort> = {
  create: jest.fn(),
  findByOrder: jest.fn(),
  updateRating: jest.fn(),
  remove: jest.fn(),
};

describe('WishlistService', () => {
  let service: WishlistService;

  const mockUserId = 'user-uuid-123';
  const mockFoodId = 'food-uuid-456';
  const mockWishlistId = 'wishlist-uuid-789';

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
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createInput = {
      userId: mockUserId,
      foodId: mockFoodId,
      rating: 5,
      orderId: 'order-uuid-101',
      size: PanuozzoSize.HALF,
    };

    it('should create a new wishlist item', async () => {
      mockRepository.create.mockResolvedValue(mockWishlistItem);

      const result = await service.create(createInput);

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

    it('should allow duplicate wishlist items for the same user and food', async () => {
      const duplicateItem = { ...mockWishlistItem, id: 'wishlist-uuid-dup' };
      mockRepository.create.mockResolvedValue(duplicateItem);

      const result = await service.create(createInput);

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
    it('should update the rating of a wishlist item', async () => {
      const updatedItem = { ...mockWishlistItem, rating: 4 };
      mockRepository.updateRating.mockResolvedValue(updatedItem);

      const result = await service.updateRating(mockWishlistId, { rating: 4 });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.updateRating).toHaveBeenCalledWith(
        mockWishlistId,
        4,
      );
      expect(result.rating).toBe(4);
    });

    it('should propagate NotFoundException from repository', async () => {
      mockRepository.updateRating.mockRejectedValue(
        new NotFoundException(
          `Wishlist item with ID "${mockWishlistId}" not found`,
        ),
      );

      await expect(
        service.updateRating(mockWishlistId, { rating: 4 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a wishlist item', async () => {
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(mockWishlistId);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockRepository.remove).toHaveBeenCalledWith(mockWishlistId);
    });

    it('should propagate NotFoundException from repository', async () => {
      mockRepository.remove.mockRejectedValue(
        new NotFoundException(
          `Wishlist item with ID "${mockWishlistId}" not found`,
        ),
      );

      await expect(service.remove(mockWishlistId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
