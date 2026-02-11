import * as vscode from "vscode";
import { MenuItem, Order, WishlistItem } from "../types";

export type OrderEventType = "created" | "updated" | "finalized";

export interface OrderEvent {
  type: OrderEventType;
  order: Order;
}

export interface IOrderClient extends vscode.Disposable {
  /** Fires when an order is created, updated, or finalized (server push). */
  readonly onOrderEvent: vscode.Event<OrderEvent>;

  /** Returns the currently active order, or `undefined` if none exists. */
  getActiveOrder(): Promise<Order | undefined>;

  /** Returns the available menu items. */
  getMenu(): Promise<MenuItem[]>;

  /** Adds or updates a wishlist item for the current user. */
  addWishlistItem(orderId: string, item: WishlistItem): Promise<void>;

  /** Removes a wishlist item by menu item ID for the current user. */
  removeWishlistItem(orderId: string, menuItemId: string): Promise<void>;
}
