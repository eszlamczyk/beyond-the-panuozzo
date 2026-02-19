import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateFoodRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the food item',
    example: 'Margherita',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'Price in grosze', example: 1500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'ID of the food type' })
  @IsOptional()
  @IsUUID()
  typeId?: string;
}
