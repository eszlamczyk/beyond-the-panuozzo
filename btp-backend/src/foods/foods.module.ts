import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Food } from './persistence/food.entity';
import { FoodType } from './persistence/food-type.entity';
import { UserOrder } from '../orders/persistence/user-order.entity';
import { Wishlist } from '../orders/persistence/wishlist.entity';
import { FoodsController } from './controller/foods.controller';
import { FoodTypesController } from './controller/food-types.controller';
import { FoodsService } from './domain/foods.service';
import { FoodTypesService } from './domain/food-types.service';
import { FoodsRepositoryPort } from './domain/foods-repository.port';
import { FoodTypesRepositoryPort } from './domain/food-types-repository.port';
import { FoodsTypeOrmRepository } from './persistence/foods-typeorm.repository';
import { FoodTypesTypeOrmRepository } from './persistence/food-types-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Food, FoodType, UserOrder, Wishlist]), AuthModule],
  controllers: [FoodTypesController, FoodsController],
  providers: [
    FoodsService,
    FoodTypesService,
    { provide: FoodsRepositoryPort, useClass: FoodsTypeOrmRepository },
    { provide: FoodTypesRepositoryPort, useClass: FoodTypesTypeOrmRepository },
  ],
  exports: [FoodsService, FoodTypesService],
})
export class FoodsModule {}
