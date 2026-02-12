import { PartialType } from '@nestjs/swagger';
import { CreateFoodTypeDto } from './create-food-type.dto';

export class UpdateFoodTypeDto extends PartialType(CreateFoodTypeDto) {}
