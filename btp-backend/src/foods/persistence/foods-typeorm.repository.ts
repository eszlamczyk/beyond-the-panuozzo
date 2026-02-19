import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Food } from './food.entity';
import { FoodMapper } from './food.mapper';
import { FoodModel } from '../domain/food.model';
import { FoodsRepositoryPort } from '../domain/foods-repository.port';

@Injectable()
export class FoodsTypeOrmRepository extends FoodsRepositoryPort {
  constructor(
    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,
  ) {
    super();
  }

  async findAll(): Promise<FoodModel[]> {
    const foods = await this.foodsRepository.find({
      relations: ['type'],
    });
    return foods.map((food) => FoodMapper.toDomain(food));
  }

  async findOne(id: string): Promise<FoodModel> {
    const food = await this.foodsRepository.findOne({
      where: { id },
      relations: ['type'],
    });
    if (!food) {
      throw new NotFoundException(`Food with ID "${id}" not found`);
    }
    return FoodMapper.toDomain(food);
  }
}
