export type OrderStatus = "draft" | "finalized";

export interface MenuItem {
  id: string;
  name: string;
  isHalf: boolean;
}

/** 1 = "meh, if others want it" … 5 = "I need this in my life" */
export type DesireLevel = 1 | 2 | 3 | 4 | 5;

export interface WishlistItem {
  menuItem: MenuItem;
  desireLevel: DesireLevel;
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
