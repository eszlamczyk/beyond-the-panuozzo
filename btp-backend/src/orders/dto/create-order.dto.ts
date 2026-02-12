import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'UUID of the user managing the order' })
  @IsUUID()
  managerId!: string;
}
