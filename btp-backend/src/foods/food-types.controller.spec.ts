import { Test, TestingModule } from '@nestjs/testing';
import { FoodTypesController } from './food-types.controller';
import { FoodTypesService } from './food-types.service';

describe('FoodTypesController', () => {
  let controller: FoodTypesController;
  let service: FoodTypesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodTypesController],
      providers: [
        {
          provide: FoodTypesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FoodTypesController>(FoodTypesController);
    service = module.get<FoodTypesService>(FoodTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', () => {
    const dto = { type: 'Test' };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call service.findOne', () => {
    controller.findOne('id');
    expect(service.findOne).toHaveBeenCalledWith('id');
  });

  it('should call service.update', () => {
    const dto = { type: 'Test' };
    controller.update('id', dto);
    expect(service.update).toHaveBeenCalledWith('id', dto);
  });

  it('should call service.remove', () => {
    controller.remove('id');
    expect(service.remove).toHaveBeenCalledWith('id');
  });
});
