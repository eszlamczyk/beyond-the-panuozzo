import { Injectable } from '@nestjs/common';
import { FoodModel } from './food.model';
import { FoodsRepositoryPort } from './foods-repository.port';

@Injectable()
export class FoodsService {
  constructor(private readonly foodsRepository: FoodsRepositoryPort) {}

  async findOne(id: string): Promise<FoodModel> {
    return this.foodsRepository.findOne(id);
  }
}
