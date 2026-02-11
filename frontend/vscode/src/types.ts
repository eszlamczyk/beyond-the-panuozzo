export type OrderStatus = "draft" | "finalized";

export interface MenuItem {
  id: string;
  name: string;
  isHalf: boolean;
}

export interface WishlistItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Participant {
  userId: string;
  name: string;
  wishlist: WishlistItem[];
}

export interface OrderLine {
  menuItem: MenuItem;
  assignedTo: string[];
}

export interface FinalizedOrder {
  lines: OrderLine[];
}

export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: Date;
  menu: MenuItem[];
  participants: Participant[];
  finalizedOrder?: FinalizedOrder;
}
