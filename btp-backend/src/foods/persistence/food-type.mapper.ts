import type { FoodTypeModel } from '../domain/food-type.model';
import type { FoodType } from './food-type.entity';

export class FoodTypeMapper {
  static toDomain(entity: FoodType): FoodTypeModel {
    return {
      id: entity.id,
      type: entity.type,
    };
  }
}
