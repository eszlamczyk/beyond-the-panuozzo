import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '../../auth/authenticated.decorator';
import { FoodsService } from '../domain/foods.service';
import { FoodResponseDto } from './dto/food-response.dto';
import { CreateFoodRequestDto } from './dto/create-food-request.dto';
import { UpdateFoodRequestDto } from './dto/update-food-request.dto';

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

  @Authenticated('admin')
  @Post()
  async create(@Body() dto: CreateFoodRequestDto): Promise<FoodResponseDto> {
    const food = await this.foodsService.create(dto);
    return FoodResponseDto.fromDomain(food);
  }

  @Authenticated('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFoodRequestDto,
  ): Promise<FoodResponseDto> {
    const food = await this.foodsService.update(id, dto);
    return FoodResponseDto.fromDomain(food);
  }

  @Authenticated('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.foodsService.remove(id);
  }
}
