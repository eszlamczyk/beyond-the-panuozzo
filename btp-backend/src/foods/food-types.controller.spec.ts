import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FoodTypesController } from './food-types.controller';
import { FoodTypesService } from './food-types.service';
import type { CreateFoodTypeDto } from './dto/create-food-type.dto';
import type { UpdateFoodTypeDto } from './dto/update-food-type.dto';
import type { FoodType } from './food-type.entity';

describe('FoodTypesController', () => {
  let controller: FoodTypesController;
  let service: FoodTypesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  it('should call service.create', async () => {
    const dto: CreateFoodTypeDto = { type: 'Test Type' };
    const createSpy = jest
      .spyOn(service, 'create')
      .mockResolvedValue(mockFoodType);
    const result = await controller.create(dto);
    expect(createSpy).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockFoodType);
  });

  it('should call service.findAll', async () => {
    const findAllSpy = jest
      .spyOn(service, 'findAll')
      .mockResolvedValue([mockFoodType]);
    const result = await controller.findAll();
    expect(findAllSpy).toHaveBeenCalled();
    expect(result).toEqual([mockFoodType]);
  });

  it('should call service.findOne', async () => {
    const findOneSpy = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(mockFoodType);
    const result = await controller.findOne(mockFoodTypeId);
    expect(findOneSpy).toHaveBeenCalledWith(mockFoodTypeId);
    expect(result).toEqual(mockFoodType);
  });

  it('should call service.update', async () => {
    const dto: UpdateFoodTypeDto = { type: 'Updated Type' };
    const updatedFoodType = { ...mockFoodType, ...dto };
    const updateSpy = jest
      .spyOn(service, 'update')
      .mockResolvedValue(updatedFoodType);
    const result = await controller.update(mockFoodTypeId, dto);
    expect(updateSpy).toHaveBeenCalledWith(mockFoodTypeId, dto);
    expect(result).toEqual(updatedFoodType);
  });

  it('should call service.remove', async () => {
    const removeSpy = jest
      .spyOn(service, 'remove')
      .mockResolvedValue(undefined);
    await controller.remove(mockFoodTypeId);
    expect(removeSpy).toHaveBeenCalledWith(mockFoodTypeId);
  });
});
