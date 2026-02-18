import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '../../authentication/authenticated.decorator';
import { FoodTypesService } from '../domain/food-types.service';
import { FoodTypeResponseDto } from './dto/food-type-response.dto';

@Authenticated()
@ApiTags('Foods > Types')
@Controller('foods/types')
export class FoodTypesController {
  constructor(private readonly foodTypesService: FoodTypesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FoodTypeResponseDto> {
    const foodType = await this.foodTypesService.findOne(id);
    return FoodTypeResponseDto.fromDomain(foodType);
  }
}
