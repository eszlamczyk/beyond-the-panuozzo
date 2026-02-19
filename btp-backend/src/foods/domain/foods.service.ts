import { ConflictException, Injectable } from '@nestjs/common';
import { FoodModel } from './food.model';
import { FoodsRepositoryPort } from './foods-repository.port';

@Injectable()
export class FoodsService {
  constructor(private readonly foodsRepository: FoodsRepositoryPort) {}

  findAll(): Promise<FoodModel[]> {
    return this.foodsRepository.findAll();
  }

  async findOne(id: string): Promise<FoodModel> {
    return this.foodsRepository.findOne(id);
  }

  async create(data: {
    name: string;
    price: number;
    typeId: string;
  }): Promise<FoodModel> {
    return this.foodsRepository.create(data);
  }

  async update(
    id: string,
    data: Partial<{ name: string; price: number; typeId: string }>,
  ): Promise<FoodModel> {
    return this.foodsRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    const used = await this.foodsRepository.isUsed(id);
    if (used) {
      throw new ConflictException(
        'Cannot delete food that is used in orders or wishlists',
      );
    }
    return this.foodsRepository.remove(id);
  }
}
