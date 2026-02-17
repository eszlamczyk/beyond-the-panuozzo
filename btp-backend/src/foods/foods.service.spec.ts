import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { Food } from './food.entity';

describe('FoodsService', () => {
  let service: FoodsService;
  let repository: Partial<Record<keyof Repository<Food>, jest.Mock>>;

  const mockFood = {
    id: 'uuid',
    name: 'Margherita',
    price: 2500,
    typeId: 'type-uuid',
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodsService,
        {
          provide: getRepositoryToken(Food),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<FoodsService>(FoodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a single food', async () => {
      repository.findOne!.mockResolvedValue(mockFood);
      expect(await service.findOne('uuid')).toEqual(mockFood);
    });

    it('should throw NotFoundException', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
