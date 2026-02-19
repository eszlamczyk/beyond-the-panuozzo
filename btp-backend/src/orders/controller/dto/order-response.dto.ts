import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../order-status.enum';
import { OrderModel } from '../../domain/order.model';
import { OrderItemResponseDto } from './order-item-response.dto';

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  managerId!: string;

  @ApiProperty({ required: false })
  managerName?: string | undefined;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  static fromDomain(order: OrderModel): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = order.id;
    dto.status = order.status;
    dto.managerId = order.managerId;
    dto.managerName = order.managerName;
    dto.items = order.items.map((item) =>
      OrderItemResponseDto.fromDomain(item),
    );
    return dto;
  }
}
