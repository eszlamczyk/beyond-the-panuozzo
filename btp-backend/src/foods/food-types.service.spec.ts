import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FoodTypesService } from './food-types.service';
import { FoodType } from './food-type.entity';

describe('FoodTypesService', () => {
  let service: FoodTypesService;
  let repository: Partial<Record<keyof Repository<FoodType>, jest.Mock>>;

  const mockFoodType = { id: 'uuid', type: 'Pizza' };

  beforeEach(async () => {
    repository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodTypesService,
        {
          provide: getRepositoryToken(FoodType),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<FoodTypesService>(FoodTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a single food type', async () => {
      repository.findOneBy!.mockResolvedValue(mockFoodType);
      expect(await service.findOne('uuid')).toEqual(mockFoodType);
    });

    it('should throw NotFoundException', async () => {
      repository.findOneBy!.mockResolvedValue(null);
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
