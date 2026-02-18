import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodType } from './food-type.entity';
import { FoodTypeMapper } from './food-type.mapper';
import { FoodTypeModel } from '../domain/food-type.model';
import { FoodTypesRepositoryPort } from '../domain/food-types-repository.port';

@Injectable()
export class FoodTypesTypeOrmRepository extends FoodTypesRepositoryPort {
  constructor(
    @InjectRepository(FoodType)
    private readonly foodTypesRepository: Repository<FoodType>,
  ) {
    super();
  }

  async findOne(id: string): Promise<FoodTypeModel> {
    const foodType = await this.foodTypesRepository.findOneBy({ id });
    if (!foodType) {
      throw new NotFoundException(`FoodType with ID "${id}" not found`);
    }
    return FoodTypeMapper.toDomain(foodType);
  }
}
