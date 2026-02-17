import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wishlist } from './wishlist.entity';
import type { ObjectLiteral, Repository, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import type { CreateWishlistDto } from './dto/create-wishlist.dto';
import type { UpdateWishlistDto } from './dto/update-wishlist.dto';

const mockWishlistRepository = (): MockRepository<Wishlist> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};

describe('WishlistService', () => {
  let service: WishlistService;
  let repository: MockRepository<Wishlist>;

  const mockUserId = 'user-uuid-123';
  const mockFoodId = 'food-uuid-456';
  const mockWishlistId = 'wishlist-uuid-789';

  const mockWishlist: Wishlist = {
    id: mockWishlistId,
    rating: 5,
    user: { id: mockUserId },
    food: { id: mockFoodId },
  } as Wishlist;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: getRepositoryToken(Wishlist),
          useFactory: mockWishlistRepository,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    repository = module.get<MockRepository<Wishlist>>(
      getRepositoryToken(Wishlist),
    );
  });

  describe('create', () => {
    const createDto: CreateWishlistDto = {
      userId: mockUserId,
      foodId: mockFoodId,
      rating: 5,
    };

    it('should create a new wishlist item', async () => {
      repository.findOne?.mockResolvedValue(null);
      repository.create?.mockReturnValue(mockWishlist);
      repository.save?.mockResolvedValue(mockWishlist);

      const result = await service.create(createDto);

      expect(result).toEqual(mockWishlist);
    });

    it('should update an existing wishlist item', async () => {
      repository.findOne?.mockResolvedValue(mockWishlist);

      const updateSpy = jest.spyOn(service, 'updateRating').mockResolvedValue({
        ...mockWishlist,
        rating: createDto.rating,
      });

      const result = await service.create(createDto);
      expect(updateSpy).toHaveBeenCalled();
      expect(result.rating).toBe(createDto.rating);
    });
  });

  describe('findByUser', () => {
    it('should return a list of wishlist items for a user', async () => {
      const expectedResult: Wishlist[] = [mockWishlist];
      repository.find?.mockResolvedValue(expectedResult);

      const result = await service.findByUser(mockUserId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateRating', () => {
    const updateDto: UpdateWishlistDto = { rating: 4 };

    it('should update the rating of a wishlist item', async () => {
      const updatedItem = { ...mockWishlist, ...updateDto };
      repository.preload?.mockResolvedValue(updatedItem);
      repository.save?.mockResolvedValue(updatedItem);

      const result = await service.updateRating(mockWishlistId, updateDto);
      expect(result.rating).toBe(updateDto.rating);
    });
  });

  describe('remove', () => {
    it('should remove a wishlist item', async () => {
      const deleteResult: DeleteResult = { raw: [], affected: 1 };
      repository.delete?.mockResolvedValue(deleteResult);

      await service.remove(mockWishlistId);
      expect(repository.delete).toHaveBeenCalledWith(mockWishlistId);
    });

    it('should throw NotFoundException if item to remove is not found', async () => {
      const deleteResult: DeleteResult = { raw: [], affected: 0 };
      repository.delete?.mockResolvedValue(deleteResult);

      await expect(service.remove(mockWishlistId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
