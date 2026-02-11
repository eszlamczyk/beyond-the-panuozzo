import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../order-status.enum';

export class UpdateOrderDto {
  @ApiProperty({
    enum: OrderStatus,
    description: 'The new status of the order',
    example: OrderStatus.ORDERED,
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
