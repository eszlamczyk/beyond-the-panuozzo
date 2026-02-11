import { Food } from '../foods/food.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/users.entity';
import {
  Check,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int')
  rating!: number;

  @ManyToOne(() => Food, (food) => food.wishlists)
  food!: Food;

  @ManyToOne(() => User, (user) => user.wishlists)
  user!: User;

  @ManyToOne(() => Order, (order) => order.wishlists)
  order!: Order;
}
