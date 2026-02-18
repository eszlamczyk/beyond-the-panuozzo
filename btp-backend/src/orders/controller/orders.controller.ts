import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticated } from '../../auth/authenticated.decorator';
import { OrdersService } from '../domain/orders.service';
import { OrderResponseDto } from './dto/order-response.dto';

@Authenticated()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.ordersService.findAll();
    return orders.map((order) => OrderResponseDto.fromDomain(order));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    const order = await this.ordersService.findOne(id);
    return OrderResponseDto.fromDomain(order);
  }
}
