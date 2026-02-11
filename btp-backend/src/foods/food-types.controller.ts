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
import { CreateFoodTypeDto } from './dto/create-food-type.dto';
import { UpdateFoodTypeDto } from './dto/update-food-type.dto';
import { FoodTypesService } from './food-types.service';

@Controller('food-types')
export class FoodTypesController {
  constructor(private readonly foodTypesService: FoodTypesService) {}

  @Post()
  create(@Body() createFoodTypeDto: CreateFoodTypeDto) {
    return this.foodTypesService.create(createFoodTypeDto);
  }

  @Get()
  findAll() {
    return this.foodTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foodTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFoodTypeDto: UpdateFoodTypeDto) {
    return this.foodTypesService.update(id, updateFoodTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.foodTypesService.remove(id);
  }
}
