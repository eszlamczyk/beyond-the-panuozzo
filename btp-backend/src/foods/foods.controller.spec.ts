import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import type { Food } from './food.entity';
import type { FoodType } from './food-type.entity';

describe('FoodsController', () => {
  let controller: FoodsController;
  let service: FoodsService;

  const mockService = {
    findOne: jest.fn(),
  };

  const mockFoodId = 'food-uuid-123';
  const mockFoodTypeId = 'food-type-uuid-456';

  const mockFoodType = {
    id: mockFoodTypeId,
    type: 'Test Type',
  } as unknown as FoodType;

  const mockFood = {
    id: mockFoodId,
    name: 'Test Food',
    price: 1000,
    type: mockFoodType,
  } as unknown as Food;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodsController],
      providers: [
        {
          provide: FoodsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FoodsController>(FoodsController);
    service = module.get<FoodsService>(FoodsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.findOne', async () => {
    const findOneSpy = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(mockFood);
    const result = await controller.findOne(mockFoodId);
    expect(findOneSpy).toHaveBeenCalledWith(mockFoodId);
    expect(result).toEqual(mockFood);
  });

  it('should throw NotFoundException (404) when food not found', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockRejectedValue(
        new NotFoundException(`Food with ID "${mockFoodId}" not found`),
      );
    const err = await controller.findOne(mockFoodId).catch((e) => e);
    expect(err).toBeInstanceOf(NotFoundException);
    expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
  });
});
