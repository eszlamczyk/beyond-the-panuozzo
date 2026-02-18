import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtAuthenticationGuard } from '../../authentication/jwt-authentication.guard';
import { EmailDomainGuard } from '../../authorization/email-domain.guard';
import { FoodsController } from './foods.controller';
import { FoodsService } from '../domain/foods.service';
import { NotFoundException } from '@nestjs/common';
import type { FoodModel } from '../domain/food.model';

describe('FoodsController', () => {
  let controller: FoodsController;
  let service: FoodsService;

  const mockService = { findOne: jest.fn() };
  const mockFoodId = 'food-uuid-123';
  const mockFood: FoodModel = {
    id: mockFoodId,
    name: 'Test Food',
    price: 1000,
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
});
