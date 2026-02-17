import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodType } from './food-type.entity';

@Injectable()
export class FoodTypesService {
  constructor(
    @InjectRepository(FoodType)
    private readonly foodTypesRepository: Repository<FoodType>,
  ) {}

  async findOne(id: string): Promise<FoodType> {
    const foodType = await this.foodTypesRepository.findOneBy({ id });
    if (!foodType) {
      throw new NotFoundException(`FoodType with ID "${id}" not found`);
    }
    return foodType;
  }
}
