/**
 * Mocked btp-backend client. Simulates server responses. 
 * 
 * To be replaced with real client when the backend is implemented.
 */

import * as vscode from "vscode";
import { IOrderClient, OrderEvent } from "./client";
import { FinalizedOrder, MenuItem, Order, Participant, WishlistItem } from "../types";

const MOCK_MENU: MenuItem[] = [
  { id: "classico", name: "Classico", isHalf: false },
  { id: "classico-half", name: "Classico", isHalf: true },
  { id: "diavola", name: "Diavola", isHalf: false },
  { id: "diavola-half", name: "Diavola", isHalf: true },
  { id: "margherita", name: "Margherita", isHalf: false },
  { id: "margherita-half", name: "Margherita", isHalf: true },
  { id: "vegana", name: "Vegana", isHalf: false },
  { id: "vegana-half", name: "Vegana", isHalf: true },
  { id: "capricciosa", name: "Capricciosa", isHalf: false },
  { id: "capricciosa-half", name: "Capricciosa", isHalf: true },
];

const CURRENT_USER_ID = "current-user";

function buildMockParticipants(): Participant[] {
  return [
    {
      userId: CURRENT_USER_ID,
      name: "You",
      wishlist: [],
    },
    {
      userId: "alice-id",
      name: "Alice",
      wishlist: [
        { menuItem: MOCK_MENU[4], quantity: 1 }, // Margherita whole
        { menuItem: MOCK_MENU[7], quantity: 1 }, // Vegana half
      ],
    },
    {
      userId: "bob-id",
      name: "Bob",
      wishlist: [
        { menuItem: MOCK_MENU[3], quantity: 1 }, // Diavola half
      ],
    },
  ];
}

function buildFinalizedOrder(participants: Participant[]): FinalizedOrder {
  const allItems = participants.flatMap((p) =>
    p.wishlist.map((w) => ({ ...w, participantName: p.name }))
  );

  // Group half items by base name and match them into wholes
  const halfsByName = new Map<string, { participantName: string; menuItem: MenuItem }[]>();
  const lines: FinalizedOrder["lines"] = [];

  for (const item of allItems) {
    if (item.menuItem.isHalf) {
      const baseName = item.menuItem.name;
      const existing = halfsByName.get(baseName) ?? [];
      existing.push({ participantName: item.participantName, menuItem: item.menuItem });
      halfsByName.set(baseName, existing);
    } else {
      for (let i = 0; i < item.quantity; i++) {
        lines.push({
          menuItem: item.menuItem,
          assignedTo: [item.participantName],
        });
      }
    }
  }

  // Match halves into pairs
  for (const [, halves] of halfsByName) {
    for (let i = 0; i < halves.length; i += 2) {
      const first = halves[i];
      const second = halves[i + 1];
      const wholeItem = MOCK_MENU.find(
        (m) => m.name === first.menuItem.name && !m.isHalf
      ) ?? first.menuItem;

      lines.push({
        menuItem: wholeItem,
        assignedTo: second
          ? [first.participantName, second.participantName]
          : [first.participantName + " (unmatched half)"],
      });
    }
  }

  return { lines };
}

/** Delay in ms before the mock server "pushes" a new order. */
const NEW_ORDER_DELAY_MS = 5_000;
/** Delay in ms before the mock order is finalized. */
const FINALIZE_DELAY_MS = 60_000;

export class MockOrderClient implements IOrderClient {
  private readonly _onOrderEvent = new vscode.EventEmitter<OrderEvent>();
  readonly onOrderEvent = this._onOrderEvent.event;

  private order: Order | undefined;
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    this.scheduleNewOrder();
  }

  dispose(): void {
    for (const t of this.timers) {
      clearTimeout(t);
    }
    this._onOrderEvent.dispose();
  }

  async getActiveOrder(): Promise<Order | undefined> {
    return this.order;
  }

  async getMenu(): Promise<MenuItem[]> {
    return [...MOCK_MENU];
  }

  async addWishlistItem(orderId: string, item: WishlistItem): Promise<void> {
    if (!this.order || this.order.id !== orderId || this.order.status !== "draft") {
      return;
    }

    const me = this.order.participants.find((p) => p.userId === CURRENT_USER_ID);
    if (!me) {
      return;
    }

    const existing = me.wishlist.find((w) => w.menuItem.id === item.menuItem.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      me.wishlist.push({ ...item });
    }

    this._onOrderEvent.fire({ type: "updated", order: this.order });
  }

  async removeWishlistItem(orderId: string, menuItemId: string): Promise<void> {
    if (!this.order || this.order.id !== orderId || this.order.status !== "draft") {
      return;
    }

    const me = this.order.participants.find((p) => p.userId === CURRENT_USER_ID);
    if (!me) {
      return;
    }

    me.wishlist = me.wishlist.filter((w) => w.menuItem.id !== menuItemId);
    this._onOrderEvent.fire({ type: "updated", order: this.order });
  }

  private scheduleNewOrder(): void {
    const t = setTimeout(() => {
      this.order = {
        id: "order-001",
        status: "draft",
        createdAt: new Date(),
        menu: [...MOCK_MENU],
        participants: buildMockParticipants(),
      };
      this._onOrderEvent.fire({ type: "created", order: this.order });
      this.scheduleFinalizeOrder();
    }, NEW_ORDER_DELAY_MS);
    this.timers.push(t);
  }

  private scheduleFinalizeOrder(): void {
    const t = setTimeout(() => {
      if (!this.order) {
        return;
      }
      this.order.status = "finalized";
      this.order.finalizedOrder = buildFinalizedOrder(this.order.participants);
      this._onOrderEvent.fire({ type: "finalized", order: this.order });
    }, FINALIZE_DELAY_MS);
    this.timers.push(t);
  }
}
