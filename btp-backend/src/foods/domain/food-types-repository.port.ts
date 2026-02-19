import type { FoodTypeModel } from './food-type.model';

export abstract class FoodTypesRepositoryPort {
  abstract findAll(): Promise<FoodTypeModel[]>;
  abstract findOne(id: string): Promise<FoodTypeModel>;
  abstract create(data: { type: string }): Promise<FoodTypeModel>;
  abstract update(id: string, data: { type: string }): Promise<FoodTypeModel>;
  abstract remove(id: string): Promise<void>;
  abstract isUsed(id: string): Promise<boolean>;
}
