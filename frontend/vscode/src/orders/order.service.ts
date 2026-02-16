import * as vscode from 'vscode';
import type { AuthService } from '../auth';
import type { IOrderClient } from '../api/client';
import type { MenuItem, Order, Participant, WishlistItem } from '../types';

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
  private userId: string | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly client: IOrderClient,
    private readonly auth: AuthService,
  ) {
    this.disposables.push(
      client.onOrderEvent((event) => {
        this.order = event.order;
        this.updateHasDraftOrderContext();
        this._onDidChange.fire();
      }),
      auth.onDidChangeSession(async () => {
        await this.initialize();
      }),
    );
  }

  dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this._onDidChange.dispose();
  }

  private updateHasDraftOrderContext(): void {
    const order = this.getOrder();
    vscode.commands.executeCommand(
      'setContext',
      'btp.hasDraftOrder',
      order?.status === 'draft',
    );
  }

  /**
   * Fetches the active order from the backend and caches the authenticated
   * user's ID from the JWT `sub` claim so participant lookups stay synchronous.
   */
  async initialize(): Promise<void> {
    const session = await this.auth.getSession();
    this.userId = session?.sub;
    this.order = await this.client.getActiveOrder();
    this.updateHasDraftOrderContext();
    this._onDidChange.fire();
  }

  /**
   * Returns the cached order only if the user has an active session.
   * This prevents the UI from rendering stale order data after sign-out.
   */
  getOrder(): Order | undefined {
    if (!this.userId) {
      return undefined;
    }
    return this.order;
  }

  /** Extracts the current user's wishlist from the cached order. */
  getMyWishlist(): WishlistItem[] {
    const order = this.getOrder();
    const me = order?.participants.find((p) => p.userId === this.userId);
    return me?.wishlist ?? [];
  }

  /** Returns participants other than the current user. */
  getOtherParticipants(): Participant[] {
    const order = this.getOrder();
    if (!order || !this.userId) {
      return [];
    }
    return order.participants.filter((p) => p.userId !== this.userId);
  }

  async getMenu(): Promise<MenuItem[]> {
    return this.client.getMenu();
  }

  /** Adds a wishlist item, silently no-ops if the order isn't in draft state. */
  async addItem(item: WishlistItem): Promise<void> {
    const order = this.getOrder();
    if (!order || order.status !== 'draft') {
      return;
    }
    await this.client.addWishlistItem(order.id, item);
  }

  /** Removes a wishlist item, silently no-ops if the order isn't in draft state. */
  async removeItem(menuItemId: string): Promise<void> {
    const order = this.getOrder();
    if (!order || order.status !== 'draft') {
      return;
    }
    await this.client.removeWishlistItem(order.id, menuItemId);
  }
}
