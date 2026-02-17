import { Food } from '../../foods/persistence/food.entity';
import { Order } from './order.entity';
import { PanuozzoSize } from '../panuozzo-size.enum';
import { User } from '../../users/persistence/user.entity';
import {
  Check,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('wishlist')
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class WishlistEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int')
  rating!: number;

  @ManyToOne(() => Food, (food) => food.wishlists, { nullable: false })
  food!: Food;

  @ManyToOne(() => User, (user) => user.wishlists, { nullable: false })
  user!: User;

  @ManyToOne(() => Order, (order) => order.wishlists, { nullable: false })
  order!: Order;

  @Column({ type: 'varchar' })
  size!: PanuozzoSize;
}
