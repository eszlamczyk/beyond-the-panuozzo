import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Food } from './food.entity';

@Entity('food_type')
export class FoodType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  type!: string;

  @OneToMany(() => Food, (food) => food.type)
  foods!: Food[];
}
