import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { FoodType } from './food-type.entity';
import { UserOrder } from '../orders/user-order.entity';

@Entity('foods')
export class Food {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    type: 'int',
    comment: 'Price in `grosze`',
  })
  price!: number;

  @OneToMany(() => UserOrder, (userOrder) => userOrder.food)
  userOrders!: UserOrder[];

  @ManyToOne(() => FoodType, (foodType) => foodType.foods)
  type!: FoodType;
}
