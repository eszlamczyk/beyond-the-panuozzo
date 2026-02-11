import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { Food } from './food.entity';
import type { CreateFoodDto } from './dto/create-food.dto';

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
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
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

  describe('create', () => {
    it('should create a food item', async () => {
      const createDto: CreateFoodDto = {
        name: 'Margherita',
        price: 2500,
        typeId: 'type-uuid',
      };
      const expectedFood = {
        ...createDto,
        type: { id: createDto.typeId },
      };
      repository.create!.mockReturnValue(expectedFood);
      repository.save!.mockResolvedValue(expectedFood);

      expect(await service.create(createDto)).toEqual(expectedFood);
      expect(repository.create).toHaveBeenCalledWith(expectedFood);
      expect(repository.save).toHaveBeenCalledWith(expectedFood);
    });
  });

  describe('findAll', () => {
    it('should return an array of foods', async () => {
      repository.find!.mockResolvedValue([mockFood]);
      expect(await service.findAll()).toEqual([mockFood]);
    });
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

  describe('update', () => {
    it('should update a food', async () => {
      const updateDto = { name: 'Capricciosa' };
      const updatedFood = { ...mockFood, ...updateDto };
      repository.preload!.mockResolvedValue(updatedFood);
      repository.save!.mockResolvedValue(updatedFood);

      expect(await service.update('uuid', updateDto)).toEqual(updatedFood);
    });

    it('should throw NotFoundException on update', async () => {
      repository.preload!.mockResolvedValue(null);
      await expect(service.update('uuid', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a food', async () => {
      repository.delete!.mockResolvedValue({ affected: 1 });
      await service.remove('uuid');
      expect(repository.delete).toHaveBeenCalledWith('uuid');
    });

    it('should throw NotFoundException on remove', async () => {
      repository.delete!.mockResolvedValue({ affected: 0 });
      await expect(service.remove('uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
