import type { FoodModel } from './food.model';

export abstract class FoodsRepositoryPort {
  abstract findAll(): Promise<FoodModel[]>;
  abstract findOne(id: string): Promise<FoodModel>;
  abstract create(data: {
    name: string;
    price: number;
    typeId: string;
  }): Promise<FoodModel>;
  abstract update(
    id: string,
    data: Partial<{ name: string; price: number; typeId: string }>,
  ): Promise<FoodModel>;
  abstract remove(id: string): Promise<void>;
  abstract isUsed(id: string): Promise<boolean>;
}
