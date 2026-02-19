import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class CreateFoodRequestDto {
  @ApiProperty({ description: 'Name of the food item', example: 'Margherita' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Price in grosze', example: 1500 })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiProperty({ description: 'ID of the food type' })
  @IsUUID()
  typeId!: string;
}
