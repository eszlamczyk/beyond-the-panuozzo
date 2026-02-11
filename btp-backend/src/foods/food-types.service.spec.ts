import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FoodTypesService } from './food-types.service';
import { FoodType } from './food-type.entity';
import { CreateFoodTypeDto } from './dto/create-food-type.dto';

describe('FoodTypesService', () => {
  let service: FoodTypesService;
  let repository: Partial<Record<keyof Repository<FoodType>, jest.Mock>>;

  const mockFoodType = { id: 'uuid', type: 'Pizza' };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
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

  describe('create', () => {
    it('should create a food type', async () => {
      const createDto: CreateFoodTypeDto = { type: 'Pizza' };
      repository.create!.mockReturnValue(mockFoodType);
      repository.save!.mockResolvedValue(mockFoodType);

      expect(await service.create(createDto)).toEqual(mockFoodType);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockFoodType);
    });
  });

  describe('findAll', () => {
    it('should return an array of food types', async () => {
      repository.find!.mockResolvedValue([mockFoodType]);
      expect(await service.findAll()).toEqual([mockFoodType]);
    });
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

  describe('update', () => {
    it('should update a food type', async () => {
      const updateDto = { type: 'Pasta' };
      const updatedFoodType = { ...mockFoodType, ...updateDto };
      repository.preload!.mockResolvedValue(updatedFoodType);
      repository.save!.mockResolvedValue(updatedFoodType);

      expect(await service.update('uuid', updateDto)).toEqual(updatedFoodType);
    });

    it('should throw NotFoundException on update', async () => {
      repository.preload!.mockResolvedValue(null);
      await expect(service.update('uuid', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a food type', async () => {
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
