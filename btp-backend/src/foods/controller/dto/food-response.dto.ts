import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FoodModel } from '../../domain/food.model';

export class FoodResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'Price in grosze' })
  price!: number;

  @ApiPropertyOptional()
  typeName?: string | undefined;

  static fromDomain(model: FoodModel): FoodResponseDto {
    const dto = new FoodResponseDto();
    dto.id = model.id;
    dto.name = model.name;
    dto.price = model.price;
    dto.typeName = model.typeName;
    return dto;
  }
}
