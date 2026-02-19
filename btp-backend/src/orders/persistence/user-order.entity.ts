import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/persistence/user.entity';
import { Order } from './order.entity';
import { Food } from '../../foods/persistence/food.entity';
import { PanuozzoSize } from '@btp/shared';

@Entity('user_orders')
export class UserOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.items)
  user!: User;

  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;

  @ManyToOne(() => Food)
  @JoinColumn({ name: 'food_id' })
  food!: Food;

  @Column({ type: 'varchar' })
  size!: PanuozzoSize;
}
