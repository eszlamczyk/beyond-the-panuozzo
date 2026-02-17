import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FoodTypesController } from './food-types.controller';
import { FoodTypesService } from '../domain/food-types.service';
import { NotFoundException } from '@nestjs/common';
import type { FoodTypeModel } from '../domain/food-type.model';

describe('FoodTypesController', () => {
  let controller: FoodTypesController;
  let service: FoodTypesService;

  const mockService = { findOne: jest.fn() };
  const mockFoodTypeId = 'food-type-uuid-456';
  const mockFoodType: FoodTypeModel = {
    id: mockFoodTypeId,
    type: 'Test Type',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodTypesController],
      providers: [{ provide: FoodTypesService, useValue: mockService }],
    }).compile();
    controller = module.get<FoodTypesController>(FoodTypesController);
    service = module.get<FoodTypesService>(FoodTypesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.findOne and return a DTO', async () => {
    const findOneSpy = jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(mockFoodType);
    const result = await controller.findOne(mockFoodTypeId);
    expect(findOneSpy).toHaveBeenCalledWith(mockFoodTypeId);
    expect(result).toEqual({
      id: mockFoodTypeId,
      type: 'Test Type',
    });
  });

  it('should throw NotFoundException (404) when food type not found', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockRejectedValue(
        new NotFoundException(`FoodType with ID "${mockFoodTypeId}" not found`),
      );
    await expect(controller.findOne(mockFoodTypeId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
