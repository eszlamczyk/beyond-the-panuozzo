import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Food } from './food.entity';
import { FoodType } from './food-type.entity';
import { FoodMapper } from './food.mapper';
import { FoodModel } from '../domain/food.model';
import { FoodsRepositoryPort } from '../domain/foods-repository.port';
import { UserOrder } from '../../orders/persistence/user-order.entity';
import { Wishlist } from '../../orders/persistence/wishlist.entity';

@Injectable()
export class FoodsTypeOrmRepository extends FoodsRepositoryPort {
  constructor(
    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,
    @InjectRepository(FoodType)
    private readonly foodTypeRepository: Repository<FoodType>,
    @InjectRepository(UserOrder)
    private readonly userOrdersRepository: Repository<UserOrder>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
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

  async create(data: {
    name: string;
    price: number;
    typeId: string;
  }): Promise<FoodModel> {
    const foodType = await this.foodTypeRepository.findOneBy({
      id: data.typeId,
    });
    if (!foodType) {
      throw new NotFoundException(
        `Food type with ID "${data.typeId}" not found`,
      );
    }
    const food = this.foodsRepository.create({
      name: data.name,
      price: data.price,
      type: foodType,
    });
    try {
      const saved = await this.foodsRepository.save(food);
      return this.findOne(saved.id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23503'
      ) {
        throw new ConflictException('Foreign key constraint violation');
      }
      throw error;
    }
  }

  async update(
    id: string,
    data: Partial<{ name: string; price: number; typeId: string }>,
  ): Promise<FoodModel> {
    const food = await this.foodsRepository.findOne({
      where: { id },
      relations: ['type'],
    });
    if (!food) {
      throw new NotFoundException(`Food with ID "${id}" not found`);
    }

    if (data.name !== undefined) food.name = data.name;
    if (data.price !== undefined) food.price = data.price;
    if (data.typeId !== undefined) {
      const foodType = await this.foodTypeRepository.findOneBy({
        id: data.typeId,
      });
      if (!foodType) {
        throw new NotFoundException(
          `Food type with ID "${data.typeId}" not found`,
        );
      }
      food.type = foodType;
    }

    try {
      await this.foodsRepository.save(food);
      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23503'
      ) {
        throw new ConflictException('Foreign key constraint violation');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const food = await this.foodsRepository.findOneBy({ id });
    if (!food) {
      throw new NotFoundException(`Food with ID "${id}" not found`);
    }
    try {
      await this.foodsRepository.remove(food);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23503'
      ) {
        throw new ConflictException(
          'Cannot delete food that is used in orders or wishlists',
        );
      }
      throw error;
    }
  }

  async isUsed(id: string): Promise<boolean> {
    const orderCount = await this.userOrdersRepository.count({
      where: { food: { id } },
    });
    if (orderCount > 0) return true;

    const wishlistCount = await this.wishlistRepository.count({
      where: { food: { id } },
    });
    return wishlistCount > 0;
  }
}
