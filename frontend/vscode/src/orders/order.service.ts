import * as vscode from "vscode";
import { AuthService } from "../auth";
import { IOrderClient } from "../api/client";
import { MenuItem, Order, WishlistItem } from "../types";

const CURRENT_USER_ID = "current-user";

/**
 * Mediator between the backend order API and the VS Code UI layer.
 *
 * The service maintains a local cache of the active order so the tree view
 * can render synchronously, while still reflecting real-time server updates
 * via the client's WebSocket push. It also gates all reads behind the auth
 * session — if the user is signed out, the order is hidden rather than
 * exposing stale data.
 */
export class OrderService implements vscode.Disposable {
  private readonly _onDidChange = new vscode.EventEmitter<void>();
  /** Fires whenever the order state changes — subscribers (e.g. the tree view) should refresh. */
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

  /** Fetches the active order from the backend and seeds the local cache. */
  async initialize(): Promise<void> {
    this.order = await this.client.getActiveOrder();
    this._onDidChange.fire();
  }

  /**
   * Returns the cached order only if the user has an active session.
   * This prevents the UI from rendering stale order data after sign-out.
   */
  async getOrder(): Promise<Order | undefined> {
    const session = await this.auth.getSession();
    if (!session) {
      return undefined;
    }
    return this.order;
  }

  /** Extracts the current user's wishlist from the cached order. */
  getMyWishlist(): WishlistItem[] {
    const me = this.order?.participants.find(
      (p) => p.userId === CURRENT_USER_ID
    );
    return me?.wishlist ?? [];
  }

  async getMenu(): Promise<MenuItem[]> {
    return this.client.getMenu();
  }

  /** Adds a wishlist item, silently no-ops if the order isn't in draft state. */
  async addItem(item: WishlistItem): Promise<void> {
    if (!this.order || this.order.status !== "draft") {
      return;
    }
    await this.client.addWishlistItem(this.order.id, item);
  }

  /** Removes a wishlist item, silently no-ops if the order isn't in draft state. */
  async removeItem(menuItemId: string): Promise<void> {
    if (!this.order || this.order.status !== "draft") {
      return;
    }
    await this.client.removeWishlistItem(this.order.id, menuItemId);
  }
}
