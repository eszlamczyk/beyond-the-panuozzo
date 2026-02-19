import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFoodTypeRequestDto {
  @ApiProperty({ description: 'Name of the food type', example: 'Pizza' })
  @IsString()
  @IsNotEmpty()
  type!: string;
}
