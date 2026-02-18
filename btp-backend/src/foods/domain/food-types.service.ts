import { Injectable } from '@nestjs/common';
import { FoodTypeModel } from './food-type.model';
import { FoodTypesRepositoryPort } from './food-types-repository.port';

@Injectable()
export class FoodTypesService {
  constructor(private readonly foodTypesRepository: FoodTypesRepositoryPort) {}

  async findOne(id: string): Promise<FoodTypeModel> {
    return this.foodTypesRepository.findOne(id);
  }
}
