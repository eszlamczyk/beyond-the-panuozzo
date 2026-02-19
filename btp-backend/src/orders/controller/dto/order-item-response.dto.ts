import { ApiProperty } from '@nestjs/swagger';
import { PanuozzoSize } from '@btp/shared';
import { OrderItemModel } from '../../domain/order-item.model';

export class OrderItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ required: false })
  userName?: string | undefined;

  @ApiProperty()
  foodId!: string;

  @ApiProperty({ required: false })
  foodName?: string | undefined;

  @ApiProperty({ enum: PanuozzoSize })
  size!: PanuozzoSize;

  static fromDomain(item: OrderItemModel): OrderItemResponseDto {
    const dto = new OrderItemResponseDto();
    dto.id = item.id;
    dto.userId = item.userId;
    dto.userName = item.userName;
    dto.foodId = item.foodId;
    dto.foodName = item.foodName;
    dto.size = item.size;
    return dto;
  }
}
