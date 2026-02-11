import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateFoodDto {
  @ApiProperty({ example: 'Margherita' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Price in grosze (e.g., 2500 for 25.00 PLN)', example: 2500 })
  @IsInt()
  @IsPositive()
  price!: number;

  @ApiProperty({ description: 'UUID of the food type' })
  @IsUUID()
  typeId!: string;
}
