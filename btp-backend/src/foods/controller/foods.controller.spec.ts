import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtAuthenticationGuard } from '../../auth/authentication/jwt-authentication.guard';
import { EmailDomainGuard } from '../../auth/authorization/email-domain.guard';
import { FoodsController } from './foods.controller';
import { FoodsService } from '../domain/foods.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { FoodModel } from '../domain/food.model';
import type { CreateFoodRequestDto } from './dto/create-food-request.dto';
import type { UpdateFoodRequestDto } from './dto/update-food-request.dto';

describe('FoodsController', () => {
  let controller: FoodsController;
  let service: FoodsService;

  const mockService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const mockFoodId = 'food-uuid-123';
  const mockFood: FoodModel = {
    id: mockFoodId,
    name: 'Test Food',
    price: 1000,
    typeId: 'type-uuid',
    typeName: 'Test Type',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodsController],
      providers: [{ provide: FoodsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthenticationGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(EmailDomainGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<FoodsController>(FoodsController);
    service = module.get<FoodsService>(FoodsService);
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
      .mockResolvedValue(mockFood);
    const result = await controller.findOne(mockFoodId);
    expect(findOneSpy).toHaveBeenCalledWith(mockFoodId);
    expect(result).toEqual({
      id: mockFoodId,
      name: 'Test Food',
      price: 1000,
      typeId: 'type-uuid',
      typeName: 'Test Type',
    });
  });

  it('should throw NotFoundException (404) when food not found', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockRejectedValue(
        new NotFoundException(`Food with ID "${mockFoodId}" not found`),
      );
    await expect(controller.findOne(mockFoodId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should call service.findAll and return an array of DTOs', async () => {
    const mockFoods: FoodModel[] = [
      mockFood,
      { ...mockFood, id: 'food-uuid-456', name: 'Another Food' },
    ];
    const findAllSpy = jest
      .spyOn(service, 'findAll')
      .mockResolvedValue(mockFoods);
    const result = await controller.findAll();
    expect(findAllSpy).toHaveBeenCalledWith();
    expect(result).toEqual([
      {
        id: mockFoodId,
        name: 'Test Food',
        price: 1000,
        typeId: 'type-uuid',
        typeName: 'Test Type',
      },
      {
        id: 'food-uuid-456',
        name: 'Another Food',
        price: 1000,
        typeId: 'type-uuid',
        typeName: 'Test Type',
      },
    ]);
  });

  it('should call service.create and return the created DTO', async () => {
    const createDto: CreateFoodRequestDto = {
      name: 'New Food',
      price: 2000,
      typeId: 'type-uuid',
    };
    const createdFood: FoodModel = {
      id: 'new-food-uuid',
      name: 'New Food',
      price: 2000,
      typeId: 'type-uuid',
      typeName: 'Test Type',
    };
    const createSpy = jest
      .spyOn(service, 'create')
      .mockResolvedValue(createdFood);
    const result = await controller.create(createDto);
    expect(createSpy).toHaveBeenCalledWith(createDto);
    expect(result).toEqual({
      id: 'new-food-uuid',
      name: 'New Food',
      price: 2000,
      typeId: 'type-uuid',
      typeName: 'Test Type',
    });
  });

  it('should call service.update and return the updated DTO', async () => {
    const updateDto: UpdateFoodRequestDto = {
      name: 'Updated Food',
      price: 3000,
    };
    const updatedFood: FoodModel = {
      ...mockFood,
      name: 'Updated Food',
      price: 3000,
    };
    const updateSpy = jest
      .spyOn(service, 'update')
      .mockResolvedValue(updatedFood);
    const result = await controller.update(mockFoodId, updateDto);
    expect(updateSpy).toHaveBeenCalledWith(mockFoodId, updateDto);
    expect(result).toEqual({
      id: mockFoodId,
      name: 'Updated Food',
      price: 3000,
      typeId: 'type-uuid',
      typeName: 'Test Type',
    });
  });

  it('should call service.remove with the correct id', async () => {
    const removeSpy = jest
      .spyOn(service, 'remove')
      .mockResolvedValue(undefined);
    await controller.remove(mockFoodId);
    expect(removeSpy).toHaveBeenCalledWith(mockFoodId);
  });

  it('should propagate ConflictException from service.remove', async () => {
    jest
      .spyOn(service, 'remove')
      .mockRejectedValue(
        new ConflictException(
          `Food with ID "${mockFoodId}" is referenced by existing orders`,
        ),
      );
    await expect(controller.remove(mockFoodId)).rejects.toThrow(
      ConflictException,
    );
  });
});
