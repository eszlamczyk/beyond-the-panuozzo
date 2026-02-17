import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Food } from './food.entity';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,
  ) {}

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
}
