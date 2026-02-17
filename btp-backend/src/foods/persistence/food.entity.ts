import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { FoodType } from './food-type.entity';
import { UserOrder } from '../../orders/persistence/user-order.entity';
import { WishlistEntity } from '../../orders/persistence/wishlist.entity';

@Entity('foods')
export class Food {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column()
  name!: string;
  @Column({ type: 'int', comment: 'Price in `grosze`' })
  price!: number;
  @OneToMany(() => UserOrder, (userOrder) => userOrder.food)
  userOrders!: UserOrder[];
  @ManyToOne(() => FoodType, (foodType) => foodType.foods)
  type!: FoodType;
  @OneToMany(() => WishlistEntity, (wishlist) => wishlist.food)
  wishlists!: WishlistEntity[];
}
