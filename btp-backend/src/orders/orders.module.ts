import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { UserOrder } from './user-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, UserOrder])],
})
export class OrdersModule {}
