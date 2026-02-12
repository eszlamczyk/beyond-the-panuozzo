import type { MenuItem, Order, WishlistItem } from '../types';

export type OrderEventType = 'created' | 'updated' | 'finalized';

export interface OrderEvent {
  type: OrderEventType;
  order: Order;
}

export interface IOrderClient {
  /** Registers a listener for order events (server push via WebSocket). */
  onOrderEvent(listener: (event: OrderEvent) => void): { dispose(): void };

  /** Returns the currently active order, or `undefined` if none exists. */
  getActiveOrder(): Promise<Order | undefined>;

  /** Returns the available menu items. */
  getMenu(): Promise<MenuItem[]>;

  /** Adds or updates a wishlist item for the current user. */
  addWishlistItem(orderId: string, item: WishlistItem): Promise<void>;

  /** Removes a wishlist item by menu item ID for the current user. */
  removeWishlistItem(orderId: string, menuItemId: string): Promise<void>;

  /** Tears down the client (closes connections, clears timers). */
  dispose(): void;
}
