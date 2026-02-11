import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from './order-status.enum';
import { User } from '../users/users.entity';
import { UserOrder } from './user-order.entity';
import { Wishlist } from 'src/wishlist/wishlist.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'smallint',
    default: OrderStatus.DRAFT,
    comment: '0=Draft, 1=To_order, 2= Ordered, 3=Eaten',
  })
  status!: OrderStatus;

  @ManyToOne(() => User, (user) => user.managedOrders)
  manager!: User;

  @OneToMany(() => UserOrder, (userOrder) => userOrder.order)
  items!: UserOrder[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.order)
  wishlists!: Wishlist;
}
