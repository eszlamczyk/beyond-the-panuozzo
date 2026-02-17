import { ApiProperty } from '@nestjs/swagger';
import { FoodTypeModel } from '../../domain/food-type.model';

export class FoodTypeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  static fromDomain(model: FoodTypeModel): FoodTypeResponseDto {
    const dto = new FoodTypeResponseDto();
    dto.id = model.id;
    dto.type = model.type;
    return dto;
  }
}
