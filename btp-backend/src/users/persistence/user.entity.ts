import { WishlistEntity } from '../../orders/persistence/wishlist.entity';
import { Order } from '../../orders/persistence/order.entity';
import { UserOrder } from '../../orders/persistence/user-order.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column()
  firstName!: string;
  @Column()
  lastName!: string;
  @Column()
  email!: string;
  @Column()
  phoneNumber!: string;
  @OneToMany(() => Order, (order) => order.manager)
  managedOrders!: Order[];
  @OneToMany(() => UserOrder, (userOrder) => userOrder.user)
  items!: UserOrder[];
  @OneToMany(() => WishlistEntity, (wishlist) => wishlist.user)
  wishlists!: WishlistEntity[];
}
