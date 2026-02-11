import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

const mockWishlistService = {
  create: jest.fn(),
  findByUser: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a wishlist item', async () => {
      const createDto: CreateWishlistDto = {
        userId: mockUserId,
        foodId: mockFoodId,
        rating: 5,
      };
      const expectedResult = { id: mockWishlistId, ...createDto };
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult as any);

      const result = await controller.create(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByUser', () => {
    it('should get wishlist items for a user', async () => {
      const expectedResult = [
        { id: mockWishlistId, userId: mockUserId, foodId: mockFoodId, rating: 5 },
      ];
      jest.spyOn(service, 'findByUser').mockResolvedValue(expectedResult as any);

      const result = await controller.findByUser(mockUserId);
      expect(service.findByUser).toHaveBeenCalledWith(mockUserId);
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
      jest
        .spyOn(service, 'updateRating')
        .mockResolvedValue(expectedResult as any);

      const result = await controller.update(mockWishlistId, updateDto);
      expect(service.updateRating).toHaveBeenCalledWith(mockWishlistId, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a wishlist item', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);
      const result = await controller.remove(mockWishlistId);
      expect(service.remove).toHaveBeenCalledWith(mockWishlistId);
      expect(result).toBeUndefined();
    });
  });
});
