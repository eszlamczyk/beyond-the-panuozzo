import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodType } from './food-type.entity';
import { Food } from './food.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Food, FoodType])],
  exports: [TypeOrmModule],
})
export class FoodsModule {}
