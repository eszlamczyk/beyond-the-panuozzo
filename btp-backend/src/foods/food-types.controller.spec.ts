import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FoodTypesController } from './food-types.controller';
import { FoodTypesService } from './food-types.service';
import type { FoodType } from './food-type.entity';

describe('FoodTypesController', () => {
  let controller: FoodTypesController;
  let service: FoodTypesService;

  const mockService = {
    findOne: jest.fn(),
  };

  const mockFoodTypeId = 'food-type-uuid-456';

  const mockFoodType = {
    id: mockFoodTypeId,
    type: 'Test Type',
    foods: [],
  } as unknown as FoodType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodTypesController],
      providers: [
        {
          provide: FoodTypesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FoodTypesController>(FoodTypesController);
    service = module.get<FoodTypesService>(FoodTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.findOne', async () => {
    const findOneSpy = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(mockFoodType);
    const result = await controller.findOne(mockFoodTypeId);
    expect(findOneSpy).toHaveBeenCalledWith(mockFoodTypeId);
    expect(result).toEqual(mockFoodType);
  });
});
