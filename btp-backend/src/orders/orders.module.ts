import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodsModule } from '../foods/foods.module';
import { UsersModule } from '../users/users.module';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UserOrder } from './user-order.entity';
import { OrderMaterializationModule } from './order_materialization/order_materialization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, UserOrder]),
    FoodsModule,
    UsersModule,
    OrderMaterializationModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
