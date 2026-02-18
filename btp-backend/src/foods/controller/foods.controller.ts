import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FoodsService } from '../domain/foods.service';
import { FoodResponseDto } from './dto/food-response.dto';

@ApiTags('Foods')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FoodResponseDto> {
    const food = await this.foodsService.findOne(id);
    return FoodResponseDto.fromDomain(food);
  }
}
