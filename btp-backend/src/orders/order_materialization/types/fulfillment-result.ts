import type { AddFoodToOrderDto } from 'src/orders/dto/add-food-to-order.dto';

export interface FulfillmentResult {
  totalScore: number;
  orders: AddFoodToOrderDto[];
  sacrificedUserIds: string[];
}
