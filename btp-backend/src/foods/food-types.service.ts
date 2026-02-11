import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFoodTypeDto } from './dto/create-food-type.dto';
import { UpdateFoodTypeDto } from './dto/update-food-type.dto';
import { FoodType } from './food-type.entity';

@Injectable()
export class FoodTypesService {
  constructor(
    @InjectRepository(FoodType)
    private readonly foodTypesRepository: Repository<FoodType>,
  ) {}

  create(createFoodTypeDto: CreateFoodTypeDto): Promise<FoodType> {
    const foodType = this.foodTypesRepository.create(createFoodTypeDto);
    return this.foodTypesRepository.save(foodType);
  }

  findAll(): Promise<FoodType[]> {
    return this.foodTypesRepository.find();
  }

  async findOne(id: string): Promise<FoodType> {
    const foodType = await this.foodTypesRepository.findOneBy({ id });
    if (!foodType) {
      throw new NotFoundException(`FoodType with ID "${id}" not found`);
    }
    return foodType;
  }

  async update(
    id: string,
    updateFoodTypeDto: UpdateFoodTypeDto,
  ): Promise<FoodType> {
    const foodType = await this.foodTypesRepository.preload({
      id,
      ...updateFoodTypeDto,
    });
    if (!foodType) {
      throw new NotFoundException(`FoodType with ID "${id}" not found`);
    }
    return this.foodTypesRepository.save(foodType);
  }

  async remove(id: string): Promise<void> {
    const result = await this.foodTypesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`FoodType with ID "${id}" not found`);
    }
  }
}
