import type { FoodModel } from './food.model';

export abstract class FoodsRepositoryPort {
  abstract findOne(id: string): Promise<FoodModel>;
}
