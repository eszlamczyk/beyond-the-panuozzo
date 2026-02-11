import { Test, TestingModule } from '@nestjs/testing';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';

describe('FoodsController', () => {
  let controller: FoodsController;
  let service: FoodsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodsController],
      providers: [
        {
          provide: FoodsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FoodsController>(FoodsController);
    service = module.get<FoodsService>(FoodsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', () => {
    const dto = { name: 'Test', price: 100, typeId: 'uuid' };
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
    const dto = { name: 'Test' };
    controller.update('id', dto);
    expect(service.update).toHaveBeenCalledWith('id', dto);
  });

  it('should call service.remove', () => {
    controller.remove('id');
    expect(service.remove).toHaveBeenCalledWith('id');
  });
});
