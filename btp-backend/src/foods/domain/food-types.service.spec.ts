import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FoodTypesService } from './food-types.service';
import { FoodTypesRepositoryPort } from './food-types-repository.port';
import type { FoodTypeModel } from './food-type.model';

describe('FoodTypesService', () => {
  let service: FoodTypesService;
  let repository: jest.Mocked<FoodTypesRepositoryPort>;

  const mockFoodType: FoodTypeModel = { id: 'uuid', type: 'Pizza' };

  beforeEach(async () => {
    const mockRepository: jest.Mocked<FoodTypesRepositoryPort> = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodTypesService,
        { provide: FoodTypesRepositoryPort, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<FoodTypesService>(FoodTypesService);
    repository = module.get(FoodTypesRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a single food type', async () => {
      repository.findOne.mockResolvedValue(mockFoodType);
      expect(await service.findOne('uuid')).toEqual(mockFoodType);
    });

    it('should throw NotFoundException', async () => {
      repository.findOne.mockRejectedValue(
        new NotFoundException('FoodType with ID "uuid" not found'),
      );
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
