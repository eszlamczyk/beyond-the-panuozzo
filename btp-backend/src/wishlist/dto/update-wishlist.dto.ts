import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateWishlistDto {
  @ApiProperty({
    description: 'New rating from 1 to 5',
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
