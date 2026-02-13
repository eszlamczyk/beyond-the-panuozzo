import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '../authentication/authentication.module';
import { OrderEventsController } from './order-events.controller';
import { OrderEventsService } from './order-events.service';
import { Order } from './order.entity';
import { UserOrder } from './user-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, UserOrder]), AuthenticationModule],
  controllers: [OrderEventsController],
  providers: [OrderEventsService],
  exports: [OrderEventsService],
})
export class OrdersModule {}
