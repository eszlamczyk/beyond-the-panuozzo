import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFoodTypeDto {
  @ApiProperty({ example: 'Pizza' })
  @IsString()
  @IsNotEmpty()
  type!: string;
}
