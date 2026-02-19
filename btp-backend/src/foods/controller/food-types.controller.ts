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
import { FoodTypesService } from '../domain/food-types.service';
import { FoodTypeResponseDto } from './dto/food-type-response.dto';
import { CreateFoodTypeRequestDto } from './dto/create-food-type-request.dto';
import { UpdateFoodTypeRequestDto } from './dto/update-food-type-request.dto';

@Authenticated()
@ApiTags('Foods > Types')
@Controller('foods/types')
export class FoodTypesController {
  constructor(private readonly foodTypesService: FoodTypesService) {}

  @Get()
  async findAll(): Promise<FoodTypeResponseDto[]> {
    const types = await this.foodTypesService.findAll();
    return types.map((t) => FoodTypeResponseDto.fromDomain(t));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FoodTypeResponseDto> {
    const foodType = await this.foodTypesService.findOne(id);
    return FoodTypeResponseDto.fromDomain(foodType);
  }

  @Authenticated('admin')
  @Post()
  async create(
    @Body() dto: CreateFoodTypeRequestDto,
  ): Promise<FoodTypeResponseDto> {
    const foodType = await this.foodTypesService.create(dto);
    return FoodTypeResponseDto.fromDomain(foodType);
  }

  @Authenticated('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFoodTypeRequestDto,
  ): Promise<FoodTypeResponseDto> {
    const foodType = await this.foodTypesService.update(id, dto);
    return FoodTypeResponseDto.fromDomain(foodType);
  }

  @Authenticated('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.foodTypesService.remove(id);
  }
}
