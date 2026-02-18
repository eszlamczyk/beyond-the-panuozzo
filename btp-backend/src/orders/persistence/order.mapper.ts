import type { OrderModel } from '../domain/order.model';
import type { OrderItemModel } from '../domain/order-item.model';
import type { Order } from './order.entity';

export class OrderMapper {
  static toDomain(entity: Order): OrderModel {
    if (!entity.manager) {
      throw new Error(
        `Order "${entity.id}" is missing the manager relation. Ensure it is loaded before mapping.`,
      );
    }

    if (!entity.items) {
      throw new Error(
        `Order "${entity.id}" is missing the items relation. Ensure it is loaded (with nested items.user and items.food) before mapping.`,
      );
    }

    const items: OrderItemModel[] = entity.items.map((item) => {
      if (!item.user) {
        throw new Error(
          `OrderItem "${item.id}" on Order "${entity.id}" is missing the user relation. Ensure items.user is loaded before mapping.`,
        );
      }
      if (!item.food) {
        throw new Error(
          `OrderItem "${item.id}" on Order "${entity.id}" is missing the food relation. Ensure items.food is loaded before mapping.`,
        );
      }

      return {
        id: item.id,
        userId: item.user.id,
        userName: `${item.user.firstName} ${item.user.lastName}`,
        foodId: item.food.id,
        foodName: item.food.name,
        size: item.size,
      };
    });

    return {
      id: entity.id,
      status: entity.status,
      managerId: entity.manager.id,
      managerName: `${entity.manager.firstName} ${entity.manager.lastName}`,
      items,
    };
  }
}
