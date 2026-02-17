import type { OrderModel } from '../domain/order.model';
import type { OrderItemModel } from '../domain/order-item.model';
import type { Order } from './order.entity';

export class OrderMapper {
  static toDomain(entity: Order): OrderModel {
    return {
      id: entity.id,
      status: entity.status,
      managerId: entity.manager?.id,
      managerName: entity.manager
        ? `${entity.manager.firstName} ${entity.manager.lastName}`
        : undefined,
      items: (entity.items ?? []).map(
        (item): OrderItemModel => ({
          id: item.id,
          userId: item.user?.id,
          userName: item.user
            ? `${item.user.firstName} ${item.user.lastName}`
            : undefined,
          foodId: item.food?.id,
          foodName: item.food?.name,
          size: item.size,
        }),
      ),
    };
  }
}
