import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodsModule } from '../foods/foods.module';
import { UsersModule } from '../users/users.module';
import { Order } from './persistence/order.entity';
import { WishlistEntity } from './persistence/wishlist.entity';
import { OrdersController } from './controller/orders.controller';
import { WishlistController } from './controller/wishlist.controller';
import { OrdersService } from './domain/orders.service';
import { WishlistService } from './domain/wishlist.service';
import { OrdersRepositoryPort } from './domain/orders-repository.port';
import { OrdersTypeOrmRepository } from './persistence/orders-typeorm.repository';
import { WishlistRepositoryPort } from './domain/wishlist-repository.port';
import { WishlistTypeOrmRepository } from './persistence/wishlist-typeorm.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, WishlistEntity]),
    FoodsModule,
    UsersModule,
  ],
  controllers: [OrdersController, WishlistController],
  providers: [
    OrdersService,
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
  exports: [OrdersService, WishlistService],
})
export class OrdersModule {}
