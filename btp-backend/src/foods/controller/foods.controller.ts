import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '../../auth/authenticated.decorator';
import { FoodsService } from '../domain/foods.service';
import { FoodResponseDto } from './dto/food-response.dto';

@Authenticated()
@ApiTags('Foods')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get()
  async findAll(): Promise<FoodResponseDto[]> {
    const foods = await this.foodsService.findAll();
    return foods.map((food) => FoodResponseDto.fromDomain(food));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FoodResponseDto> {
    const food = await this.foodsService.findOne(id);
    return FoodResponseDto.fromDomain(food);
  }
}
