import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddFoodToOrderDto {
  @ApiProperty({ description: 'UUID of the food item to add' })
  @IsUUID()
  foodId!: string;

  @ApiProperty({ description: 'UUID of the user adding the item' })
  @IsUUID()
  userId!: string;
}
