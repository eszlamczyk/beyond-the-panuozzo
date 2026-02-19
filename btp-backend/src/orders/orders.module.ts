import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { FoodsModule } from '../foods/foods.module';
import { UsersModule } from '../users/users.module';
import { Order } from './persistence/order.entity';
import { UserOrder } from './persistence/user-order.entity';
import { Wishlist } from './persistence/wishlist.entity';
import { OrdersController } from './controller/orders.controller';
import { OrderEventsController } from './controller/order-events.controller';
import { WishlistController } from './controller/wishlist.controller';
import { OrdersService } from './domain/orders.service';
import { OrderEventsService } from './domain/order-events.service';
import { WishlistService } from './domain/wishlist.service';
import { OrdersRepositoryPort } from './domain/orders-repository.port';
import { OrdersTypeOrmRepository } from './persistence/orders-typeorm.repository';
import { WishlistRepositoryPort } from './domain/wishlist-repository.port';
import { WishlistTypeOrmRepository } from './persistence/wishlist-typeorm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, UserOrder, Wishlist]),
    AuthModule,
    FoodsModule,
    UsersModule,
  ],
  controllers: [OrdersController, OrderEventsController, WishlistController],
  providers: [
    OrdersService,
    OrderEventsService,
    WishlistService,
    {
      provide: OrdersRepositoryPort,
      useClass: OrdersTypeOrmRepository,
    },
    {
      provide: WishlistRepositoryPort,
      useClass: WishlistTypeOrmRepository,
    },
  ],
  exports: [OrdersService, OrderEventsService, WishlistService],
})
export class OrdersModule {}
