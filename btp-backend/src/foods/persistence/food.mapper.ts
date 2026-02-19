import type { FoodModel } from '../domain/food.model';
import type { Food } from './food.entity';

export class FoodMapper {
  static toDomain(entity: Food): FoodModel {
    return {
      id: entity.id,
      name: entity.name,
      price: entity.price,
      typeId: entity.type.id,
      typeName: entity.type.type,
    };
  }
}
