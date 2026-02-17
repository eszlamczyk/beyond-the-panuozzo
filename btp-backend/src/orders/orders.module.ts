import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodsModule } from '../foods/foods.module';
import { UsersModule } from '../users/users.module';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UserOrder } from './user-order.entity';
import { Wishlist } from './wishlist/wishlist.entity';
import { WishlistController } from './wishlist/wishlist.controller';
import { WishlistService } from './wishlist/wishlist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, UserOrder, Wishlist]),
    FoodsModule,
    UsersModule,
  ],
  controllers: [OrdersController, WishlistController],
  providers: [OrdersService, WishlistService],
  exports: [OrdersService, WishlistService],
})
export class OrdersModule {}
