import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wishlist } from './wishlist.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

const mockWishlistRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('WishlistService', () => {
  let service: WishlistService;
  let repository: MockRepository<Wishlist>;

  const mockUserId = 'user-uuid-123';
  const mockFoodId = 'food-uuid-456';
  const mockWishlistId = 'wishlist-uuid-789';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateWishlistDto = {
      userId: mockUserId,
      foodId: mockFoodId,
      rating: 5,
    };

    it('should create a new wishlist item', async () => {
      repository.findOne!.mockResolvedValue(null);
      const expectedResult = { id: mockWishlistId, ...createDto };
      repository.create!.mockReturnValue(expectedResult as any);
      repository.save!.mockResolvedValue(expectedResult as any);

      const result = await service.create(createDto);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUserId }, food: { id: mockFoodId } },
      });
      expect(repository.create).toHaveBeenCalledWith({
        rating: createDto.rating,
        user: { id: mockUserId },
        food: { id: mockFoodId },
      });
      expect(repository.save).toHaveBeenCalledWith(expectedResult);
      expect(result).toEqual(expectedResult);
    });

    it('should update an existing wishlist item', async () => {
      const existingItem = { id: mockWishlistId, rating: 3 };
      repository.findOne!.mockResolvedValue(existingItem as any);
      const updateSpy = jest
        .spyOn(service, 'updateRating')
        .mockResolvedValue({ ...existingItem, rating: createDto.rating } as any);

      const result = await service.create(createDto);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUserId }, food: { id: mockFoodId } },
      });
      expect(updateSpy).toHaveBeenCalledWith(existingItem.id, {
        rating: createDto.rating,
      });
      expect(result.rating).toBe(createDto.rating);
    });
  });

  describe('findByUser', () => {
    it('should return a list of wishlist items for a user', async () => {
      const expectedResult = [
        { id: mockWishlistId, userId: mockUserId, foodId: mockFoodId, rating: 5 },
      ];
      repository.find!.mockResolvedValue(expectedResult as any);
      const result = await service.findByUser(mockUserId);
      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUserId } },
        relations: ['food'],
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateRating', () => {
    const updateDto: UpdateWishlistDto = { rating: 4 };

    it('should update the rating of a wishlist item', async () => {
      const existingItem = { id: mockWishlistId, rating: 5 };
      repository.preload!.mockResolvedValue(existingItem as any);
      repository.save!.mockResolvedValue({
        ...existingItem,
        ...updateDto,
      } as any);

      const result = await service.updateRating(mockWishlistId, updateDto);
      expect(repository.preload).toHaveBeenCalledWith({
        id: mockWishlistId,
        ...updateDto,
      });
      expect(repository.save).toHaveBeenCalledWith(existingItem);
      expect(result.rating).toBe(updateDto.rating);
    });

    it('should throw NotFoundException if item not found', async () => {
      repository.preload!.mockResolvedValue(null);
      await expect(
        service.updateRating(mockWishlistId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a wishlist item', async () => {
      repository.delete!.mockResolvedValue({ affected: 1 } as any);
      await service.remove(mockWishlistId);
      expect(repository.delete).toHaveBeenCalledWith(mockWishlistId);
    });

    it('should throw NotFoundException if item to remove is not found', async () => {
      repository.delete!.mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove(mockWishlistId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
