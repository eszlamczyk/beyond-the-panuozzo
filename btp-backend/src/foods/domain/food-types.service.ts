import { ConflictException, Injectable } from '@nestjs/common';
import { FoodTypeModel } from './food-type.model';
import { FoodTypesRepositoryPort } from './food-types-repository.port';

@Injectable()
export class FoodTypesService {
  constructor(private readonly foodTypesRepository: FoodTypesRepositoryPort) {}

  async findAll(): Promise<FoodTypeModel[]> {
    return this.foodTypesRepository.findAll();
  }

  async findOne(id: string): Promise<FoodTypeModel> {
    return this.foodTypesRepository.findOne(id);
  }

  async create(data: { type: string }): Promise<FoodTypeModel> {
    return this.foodTypesRepository.create(data);
  }

  async update(id: string, data: { type: string }): Promise<FoodTypeModel> {
    return this.foodTypesRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    const used = await this.foodTypesRepository.isUsed(id);
    if (used) {
      throw new ConflictException(
        'Cannot delete food type that has associated foods',
      );
    }
    return this.foodTypesRepository.remove(id);
  }
}
