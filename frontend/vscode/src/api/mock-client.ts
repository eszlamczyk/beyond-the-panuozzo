/**
 * Mocked btp-backend client. Simulates server responses.
 *
 * To be replaced with real client when the backend is implemented.
 */

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

function buildMockParticipants(currentUserId: string): Participant[] {
  return [
    {
      userId: currentUserId,
      name: "You",
      wishlist: [],
    },
    {
      userId: "alice-id",
      name: "Alice",
      wishlist: [
        { menuItem: MOCK_MENU[4], desireLevel: 4 }, // Margherita whole
        { menuItem: MOCK_MENU[7], desireLevel: 2 }, // Vegana half
      ],
    },
    {
      userId: "bob-id",
      name: "Bob",
      wishlist: [
        { menuItem: MOCK_MENU[3], desireLevel: 5 }, // Diavola half
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
      lines.push({
        menuItem: item.menuItem,
        assignedTo: [item.participantName],
      });
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
  private readonly listeners: ((event: OrderEvent) => void)[] = [];
  private order: Order | undefined;
  private readonly timers: ReturnType<typeof setTimeout>[] = [];
  private readonly resolveUserId: () => string;

  constructor(resolveUserId: () => string) {
    this.resolveUserId = resolveUserId;
    this.scheduleNewOrder();
  }

  onOrderEvent(listener: (event: OrderEvent) => void) {
    this.listeners.push(listener);
    return {
      dispose: () => {
        const idx = this.listeners.indexOf(listener);
        if (idx !== -1) {
          this.listeners.splice(idx, 1);
        }
      },
    };
  }

  dispose(): void {
    for (const t of this.timers) {
      clearTimeout(t);
    }
    this.listeners.length = 0;
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

    const me = this.order.participants.find((p) => p.userId === this.resolveUserId());
    if (!me) {
      return;
    }

    me.wishlist.push({ ...item });

    this.emit({ type: "updated", order: this.order });
  }

  async removeWishlistItem(orderId: string, menuItemId: string): Promise<void> {
    if (!this.order || this.order.id !== orderId || this.order.status !== "draft") {
      return;
    }

    const me = this.order.participants.find((p) => p.userId === this.resolveUserId());
    if (!me) {
      return;
    }

    me.wishlist = me.wishlist.filter((w) => w.menuItem.id !== menuItemId);
    this.emit({ type: "updated", order: this.order });
  }

  private emit(event: OrderEvent): void {
    for (const l of this.listeners) {
      l(event);
    }
  }

  private scheduleNewOrder(): void {
    const t = setTimeout(() => {
      this.order = {
        id: "order-001",
        status: "draft",
        createdAt: new Date(),
        menu: [...MOCK_MENU],
        participants: buildMockParticipants(this.resolveUserId()),
      };
      this.emit({ type: "created", order: this.order });
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
      this.emit({ type: "finalized", order: this.order });
    }, FINALIZE_DELAY_MS);
    this.timers.push(t);
  }
}
