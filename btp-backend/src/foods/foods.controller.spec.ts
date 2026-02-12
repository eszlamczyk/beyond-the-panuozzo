import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import type { CreateFoodDto } from './dto/create-food.dto';
import type { UpdateFoodDto } from './dto/update-food.dto';
import type { Food } from './food.entity';
import type { FoodType } from './food-type.entity';

describe('FoodsController', () => {
  let controller: FoodsController;
  let service: FoodsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', async () => {
    const dto: CreateFoodDto = {
      name: 'Test Food',
      price: 1000,
      typeId: mockFoodTypeId,
    };
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue(mockFood);
    const result = await controller.create(dto);
    expect(createSpy).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockFood);
  });

  it('should call service.findAll', async () => {
    const findAllSpy = jest
      .spyOn(service, 'findAll')
      .mockResolvedValue([mockFood]);
    const result = await controller.findAll();
    expect(findAllSpy).toHaveBeenCalled();
    expect(result).toEqual([mockFood]);
  });

  it('should call service.findOne', async () => {
    const findOneSpy = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(mockFood);
    const result = await controller.findOne(mockFoodId);
    expect(findOneSpy).toHaveBeenCalledWith(mockFoodId);
    expect(result).toEqual(mockFood);
  });

  it('should call service.update', async () => {
    const dto: UpdateFoodDto = { name: 'Updated Food' };
    const updatedFood = { ...mockFood, ...dto };
    const updateSpy = jest
      .spyOn(service, 'update')
      .mockResolvedValue(updatedFood);
    const result = await controller.update(mockFoodId, dto);
    expect(updateSpy).toHaveBeenCalledWith(mockFoodId, dto);
    expect(result).toEqual(updatedFood);
  });

  it('should call service.remove', async () => {
    const removeSpy = jest
      .spyOn(service, 'remove')
      .mockResolvedValue(undefined);
    await controller.remove(mockFoodId);
    expect(removeSpy).toHaveBeenCalledWith(mockFoodId);
  });
});
