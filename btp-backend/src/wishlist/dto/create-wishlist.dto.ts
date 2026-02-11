import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateWishlistDto {
  @ApiProperty({
    description: 'Rating from 1 to 5',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ description: 'ID of the food item' })
  @IsUUID()
  foodId!: string;

  @ApiProperty({ description: 'ID of the user' })
  @IsUUID()
  userId!: string;
}
