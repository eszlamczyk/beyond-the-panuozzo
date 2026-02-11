import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from './food.entity';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,
  ) {}

  create(createFoodDto: CreateFoodDto): Promise<Food> {
    const food = this.foodsRepository.create({
      ...createFoodDto,
      type: { id: createFoodDto.typeId },
    });
    return this.foodsRepository.save(food);
  }

  findAll(): Promise<Food[]> {
    return this.foodsRepository.find({ relations: ['type'] });
  }

  async findOne(id: string): Promise<Food> {
    const food = await this.foodsRepository.findOne({
      where: { id },
      relations: ['type'],
    });
    if (!food) {
      throw new NotFoundException(`Food with ID "${id}" not found`);
    }
    return food;
  }

  async update(id: string, updateFoodDto: UpdateFoodDto): Promise<Food> {
    const food = await this.foodsRepository.preload({
      id,
      ...updateFoodDto,
      ...(updateFoodDto.typeId && { type: { id: updateFoodDto.typeId } }),
    });
    if (!food) {
      throw new NotFoundException(`Food with ID "${id}" not found`);
    }
    return this.foodsRepository.save(food);
  }

  async remove(id: string): Promise<void> {
    const result = await this.foodsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Food with ID "${id}" not found`);
    }
  }
}
