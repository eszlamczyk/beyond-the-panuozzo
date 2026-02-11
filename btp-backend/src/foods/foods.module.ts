import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodType } from './food-type.entity';
import { Food } from './food.entity';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { FoodTypesController } from './food-types.controller';
import { FoodTypesService } from './food-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([Food, FoodType])],
  controllers: [FoodsController, FoodTypesController],
  providers: [FoodsService, FoodTypesService],
  exports: [FoodsService, FoodTypesService],
})
export class FoodsModule {}
