import type { FoodModel } from './food.model';

export abstract class FoodsRepositoryPort {
  abstract findAll(): Promise<FoodModel[]>;
  abstract findOne(id: string): Promise<FoodModel>;
}
