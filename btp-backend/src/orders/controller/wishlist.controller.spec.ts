import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from '../domain/wishlist.service';
import type { CreateWishlistRequestDto } from './dto/create-wishlist-request.dto';
import type { UpdateWishlistRequestDto } from './dto/update-wishlist-request.dto';
import { NotFoundException } from '@nestjs/common';
import { PanuozzoSize } from '../panuozzo-size.enum';
import type { WishlistItem } from '../domain/wishlist.model';

const mockWishlistService = {
  create: jest.fn(),
  findByOrder: jest.fn(),
  updateRating: jest.fn(),
  remove: jest.fn(),
};

describe('WishlistController', () => {
  let controller: WishlistController;
  let service: WishlistService;

  const mockUserId = 'user-uuid-123';
  const mockFoodId = 'food-uuid-456';
  const mockWishlistId = 'wishlist-uuid-789';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        {
          provide: WishlistService,
          useValue: mockWishlistService,
        },
      ],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
    service = module.get<WishlistService>(WishlistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a wishlist item and return a response DTO', async () => {
      const orderId = 'order-uuid-101';
      const requestDto: CreateWishlistRequestDto = {
        userId: mockUserId,
        foodId: mockFoodId,
        rating: 5,
        size: PanuozzoSize.HALF,
      };
      const domainItem: WishlistItem = {
        id: mockWishlistId,
        rating: 5,
        size: PanuozzoSize.HALF,
        userId: mockUserId,
        foodId: mockFoodId,
        orderId,
      };
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(domainItem);

      const result = await controller.create(orderId, requestDto);

      expect(createSpy).toHaveBeenCalledWith({ ...requestDto, orderId });
      expect(result).toEqual({
        id: mockWishlistId,
        rating: 5,
        size: PanuozzoSize.HALF,
        userId: mockUserId,
        foodId: mockFoodId,
        foodName: undefined,
        orderId,
      });
    });
  });

  describe('findByOrder', () => {
    it('should return wishlist items as response DTOs', async () => {
      const domainItems: WishlistItem[] = [
        {
          id: mockWishlistId,
          rating: 5,
          size: PanuozzoSize.HALF,
          userId: mockUserId,
          foodId: mockFoodId,
          foodName: 'Margherita',
          orderId: 'order-uuid-101',
        },
      ];
      const findSpy = jest
        .spyOn(service, 'findByOrder')
        .mockResolvedValue(domainItems);

      const result = await controller.findByOrder('order-uuid-101');

      expect(findSpy).toHaveBeenCalledWith('order-uuid-101');
      expect(result).toHaveLength(1);
      expect(result[0]!.foodName).toBe('Margherita');
    });
  });

  describe('update', () => {
    it('should update a wishlist item and return a response DTO', async () => {
      const updateDto: UpdateWishlistRequestDto = { rating: 4 };
      const domainItem: WishlistItem = {
        id: mockWishlistId,
        rating: 4,
        size: PanuozzoSize.HALF,
        userId: mockUserId,
        foodId: mockFoodId,
        orderId: 'order-uuid-101',
      };
      const updateSpy = jest
        .spyOn(service, 'updateRating')
        .mockResolvedValue(domainItem);

      const result = await controller.update(mockWishlistId, updateDto);

      expect(updateSpy).toHaveBeenCalledWith(mockWishlistId, updateDto);
      expect(result.rating).toBe(4);
    });

    it('should throw NotFoundException (404) when item not found', async () => {
      const updateDto: UpdateWishlistRequestDto = { rating: 4 };
      jest
        .spyOn(service, 'updateRating')
        .mockRejectedValue(
          new NotFoundException(
            `Wishlist item with ID "${mockWishlistId}" not found`,
          ),
        );
      await expect(
        controller.update(mockWishlistId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a wishlist item', async () => {
      const removeSpy = jest
        .spyOn(service, 'remove')
        .mockResolvedValue(undefined);
      const result = await controller.remove(mockWishlistId);
      expect(removeSpy).toHaveBeenCalledWith(mockWishlistId);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException (404) when item not found', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(
          new NotFoundException(
            `Wishlist item with ID "${mockWishlistId}" not found`,
          ),
        );
      await expect(controller.remove(mockWishlistId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
