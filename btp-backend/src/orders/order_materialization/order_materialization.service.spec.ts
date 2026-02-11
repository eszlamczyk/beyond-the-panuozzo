import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { OrderMaterializationService } from './order_materialization.service';

describe('OrderMaterializationService', () => {
  let service: OrderMaterializationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderMaterializationService],
    }).compile();

    service = module.get<OrderMaterializationService>(
      OrderMaterializationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
