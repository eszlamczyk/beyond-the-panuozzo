import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Order } from './order.entity';
import { Food } from '../foods/food.entity';

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
}
