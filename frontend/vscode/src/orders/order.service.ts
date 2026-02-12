import * as vscode from "vscode";
import { AuthService } from "../auth";
import { IOrderClient } from "../api/client";
import { MenuItem, Order, WishlistItem } from "../types";

const CURRENT_USER_ID = "current-user";

export class OrderService implements vscode.Disposable {
  private readonly _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;

  private order: Order | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly client: IOrderClient,
    private readonly auth: AuthService,
  ) {
    client.onOrderEvent((event) => {
      this.order = event.order;
      this._onDidChange.fire();
    });
    this.disposables.push(
      auth.onDidChangeSession(() => {
        this._onDidChange.fire();
      })
    );
  }

  dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this._onDidChange.dispose();
  }

  async initialize(): Promise<void> {
    this.order = await this.client.getActiveOrder();
    this._onDidChange.fire();
  }

  async getOrder(): Promise<Order | undefined> {
    const session = await this.auth.getSession();
    if (!session) {
      return undefined;
    }
    return this.order;
  }

  getMyWishlist(): WishlistItem[] {
    if (!this.order) {
      return [];
    }
    const me = this.order.participants.find((p) => p.userId === CURRENT_USER_ID);
    return me?.wishlist ?? [];
  }

  async getMenu(): Promise<MenuItem[]> {
    return this.client.getMenu();
  }

  async addItem(item: WishlistItem): Promise<void> {
    if (!this.order || this.order.status !== "draft") {
      return;
    }
    await this.client.addWishlistItem(this.order.id, item);
  }

  async removeItem(menuItemId: string): Promise<void> {
    if (!this.order || this.order.status !== "draft") {
      return;
    }
    await this.client.removeWishlistItem(this.order.id, menuItemId);
  }
}
