import { Controller, Get, Param } from '@nestjs/common';
import { FoodTypesService } from './food-types.service';

@Controller('food-types')
export class FoodTypesController {
  constructor(private readonly foodTypesService: FoodTypesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foodTypesService.findOne(id);
  }
}
