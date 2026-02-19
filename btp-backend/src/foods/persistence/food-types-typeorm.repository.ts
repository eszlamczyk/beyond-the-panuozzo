import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { FoodType } from './food-type.entity';
import { Food } from './food.entity';
import { FoodTypeMapper } from './food-type.mapper';
import { FoodTypeModel } from '../domain/food-type.model';
import { FoodTypesRepositoryPort } from '../domain/food-types-repository.port';

@Injectable()
export class FoodTypesTypeOrmRepository extends FoodTypesRepositoryPort {
  constructor(
    @InjectRepository(FoodType)
    private readonly foodTypesRepository: Repository<FoodType>,
    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,
  ) {
    super();
  }

  async findAll(): Promise<FoodTypeModel[]> {
    const foodTypes = await this.foodTypesRepository.find();
    return foodTypes.map((ft) => FoodTypeMapper.toDomain(ft));
  }

  async findOne(id: string): Promise<FoodTypeModel> {
    const foodType = await this.foodTypesRepository.findOneBy({ id });
    if (!foodType) {
      throw new NotFoundException(`FoodType with ID "${id}" not found`);
    }
    return FoodTypeMapper.toDomain(foodType);
  }

  async create(data: { type: string }): Promise<FoodTypeModel> {
    const foodType = this.foodTypesRepository.create(data);
    const saved = await this.foodTypesRepository.save(foodType);
    return FoodTypeMapper.toDomain(saved);
  }

  async update(id: string, data: { type: string }): Promise<FoodTypeModel> {
    const foodType = await this.foodTypesRepository.findOneBy({ id });
    if (!foodType) {
      throw new NotFoundException(`FoodType with ID "${id}" not found`);
    }
    foodType.type = data.type;
    const saved = await this.foodTypesRepository.save(foodType);
    return FoodTypeMapper.toDomain(saved);
  }

  async remove(id: string): Promise<void> {
    const foodType = await this.foodTypesRepository.findOneBy({ id });
    if (!foodType) {
      throw new NotFoundException(`FoodType with ID "${id}" not found`);
    }
    try {
      await this.foodTypesRepository.remove(foodType);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23503'
      ) {
        throw new ConflictException(
          'Cannot delete food type that has associated foods',
        );
      }
      throw error;
    }
  }

  async isUsed(id: string): Promise<boolean> {
    const count = await this.foodsRepository.count({
      where: { type: { id } },
    });
    return count > 0;
  }
}
