import type { FoodTypeModel } from './food-type.model';

export abstract class FoodTypesRepositoryPort {
  abstract findOne(id: string): Promise<FoodTypeModel>;
}
