import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import type { CreateWishlistDto } from './dto/create-wishlist.dto';
import type { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import type { Wishlist } from './wishlist.entity';
import { PanuozzoSize } from '../panuozzo-size.enum';

const mockWishlistService = {
  create: jest.fn(),
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
    it('should create a wishlist item', async () => {
      const createDto: CreateWishlistDto = {
        userId: mockUserId,
        foodId: mockFoodId,
        rating: 5,
        orderId: 'order-uuid-101',
        size: PanuozzoSize.HALF,
      };
      const expectedResult = { id: mockWishlistId, ...createDto };
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(expectedResult as unknown as Wishlist);

      const result = await controller.create(createDto);
      expect(createSpy).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a wishlist item', async () => {
      const updateDto: UpdateWishlistDto = { rating: 4 };
      const expectedResult = {
        id: mockWishlistId,
        userId: mockUserId,
        foodId: mockFoodId,
        rating: 4,
      };
      const updateSpy = jest
        .spyOn(service, 'updateRating')
        .mockResolvedValue(expectedResult as unknown as Wishlist);

      const result = await controller.update(mockWishlistId, updateDto);
      expect(updateSpy).toHaveBeenCalledWith(mockWishlistId, updateDto);
      expect(result).toEqual(expectedResult);
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
      const err = await controller.remove(mockWishlistId).catch((e) => e);
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException (404) when item not found', async () => {
      const updateDto: UpdateWishlistDto = { rating: 4 };
      jest
        .spyOn(service, 'updateRating')
        .mockRejectedValue(
          new NotFoundException(
            `Wishlist item with ID "${mockWishlistId}" not found`,
          ),
        );
      const err = await controller
        .update(mockWishlistId, updateDto)
        .catch((e) => e);
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
