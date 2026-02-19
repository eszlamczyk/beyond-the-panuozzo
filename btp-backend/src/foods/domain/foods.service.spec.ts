import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { FoodsRepositoryPort } from './foods-repository.port';
import type { FoodModel } from './food.model';

describe('FoodsService', () => {
  let service: FoodsService;
  let repository: jest.Mocked<FoodsRepositoryPort>;

  const mockFood: FoodModel = {
    id: 'uuid',
    name: 'Margherita',
    price: 2500,
    typeId: 'type-uuid',
    typeName: 'Pizza',
  };

  beforeEach(async () => {
    const mockRepository: jest.Mocked<FoodsRepositoryPort> = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      isUsed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodsService,
        { provide: FoodsRepositoryPort, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<FoodsService>(FoodsService);
    repository = module.get(FoodsRepositoryPort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a single food', async () => {
      repository.findOne.mockResolvedValue(mockFood);
      expect(await service.findOne('uuid')).toEqual(mockFood);
    });

    it('should throw NotFoundException', async () => {
      repository.findOne.mockRejectedValue(
        new NotFoundException('Food with ID "uuid" not found'),
      );
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove food when not used', async () => {
      repository.isUsed.mockResolvedValue(false);
      repository.remove.mockResolvedValue(undefined);
      await service.remove('uuid');
      expect(repository.isUsed).toHaveBeenCalledWith('uuid'); // eslint-disable-line @typescript-eslint/unbound-method
      expect(repository.remove).toHaveBeenCalledWith('uuid'); // eslint-disable-line @typescript-eslint/unbound-method
    });

    it('should throw ConflictException when food is used', async () => {
      repository.isUsed.mockResolvedValue(true);
      await expect(service.remove('uuid')).rejects.toThrow(ConflictException);
      expect(repository.remove).not.toHaveBeenCalled(); // eslint-disable-line @typescript-eslint/unbound-method
    });
  });
});
