import * as vscode from "vscode";
import { OrderService } from "./order.service";
import { Commands } from "../constants";
import { DesireLevel, MenuItem, Order, WishlistItem } from "../types";

/**
 * Discriminated union of every node type the tree can contain.
 *
 * Using a tagged union instead of a class hierarchy keeps the tree logic
 * in one place (the `switch` in `getTreeItem` / `getChildren`) and makes
 * it easy to add new node kinds without touching unrelated code.
 */
type TreeNode =
  | { kind: "order-header"; order: Order }
  | { kind: "my-wishlist-header" }
  | { kind: "my-wishlist-item"; item: WishlistItem }
  | { kind: "add-item" }
  | { kind: "participants-header"; count: number }
  | { kind: "participant"; name: string; items: WishlistItem[] }
  | { kind: "participant-item"; item: WishlistItem }
  | { kind: "finalized-header" }
  | { kind: "finalized-line"; menuName: string; assignedTo: string }
  | { kind: "no-order" };

/**
 * Drives the sidebar tree view that surfaces the current order state.
 *
 * The tree adapts its shape to the order lifecycle:
 * - **No order** → single placeholder node.
 * - **Draft** → the user's editable wishlist + a read-only list of other
 *   participants, giving social context ("others already picked items")
 *   that nudges people to participate.
 * - **Finalized** → the resolved order lines with assignees, so everyone
 *   can see exactly what was ordered and for whom.
 *
 * Visible only when signed in (gated by the `btp.signedIn` context key).
 */
export class OrderTreeDataProvider
  implements vscode.TreeDataProvider<TreeNode>
{
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly orderService: OrderService) {}

  /** Signals VS Code to re-fetch the entire tree (e.g. after a wishlist mutation). */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /** Maps each node kind to its visual representation (label, icon, collapsibility). */
  getTreeItem(node: TreeNode): vscode.TreeItem {
    switch (node.kind) {
      case "no-order":
        return treeItem("No active order", { icon: "package" });

      case "order-header": {
        const status = node.order.status === "draft" ? "Draft" : "Finalized";
        return treeItem(`Order #${node.order.id} (${status})`, {
          icon: "package",
          state: Expanded,
        });
      }

      case "my-wishlist-header":
        return treeItem("My Wishlist", { icon: "checklist", state: Expanded });

      case "my-wishlist-item":
        return buildWishlistTreeItem(node.item, "circle-filled", "wishlistItem");

      case "add-item":
        return treeItem("Add item...", {
          icon: "add",
          command: { command: Commands.AddWishlistItem, title: "Add item to wishlist" },
        });

      case "participants-header":
        return treeItem(`Participants (${node.count})`, {
          icon: "organization",
          state: Collapsed,
        });

      case "participant":
        return treeItem(node.name, {
          icon: "person",
          state: node.items.length > 0 ? Collapsed : None,
          description: `${node.items.length} item(s)`,
        });

      case "participant-item":
        return buildWishlistTreeItem(node.item, "circle-outline");

      case "finalized-header":
        return treeItem("Final Order", { icon: "tasklist", state: Expanded });

      case "finalized-line":
        return treeItem(node.menuName, { icon: "arrow-right", description: node.assignedTo });
    }
  }

  /** Lazily resolves children for a given node (or the root). */
  async getChildren(element?: TreeNode): Promise<TreeNode[]> {
    if (!element) {
      return this.getRootChildren();
    }

    const order = await this.orderService.getOrder();
    if (!order) {
      return [];
    }

    switch (element.kind) {
      case "order-header":
        return this.getOrderChildren(order);
      case "my-wishlist-header":
        return this.getMyWishlistChildren();
      case "participants-header":
        return this.getParticipantNodes(order);
      case "participant":
        return element.items.map((item) => ({
          kind: "participant-item" as const,
          item,
        }));
      case "finalized-header":
        return this.getFinalizedLines(order);
      default:
        return [];
    }
  }

  private async getRootChildren(): Promise<TreeNode[]> {
    const order = await this.orderService.getOrder();
    if (order) {
      return [{ kind: "order-header", order }];
    }
    return [{ kind: "no-order" }];
  }

  /**
   * Splits the order into sections based on status. A draft shows the
   * user's own wishlist separately from others so they can edit theirs
   * while still seeing the group's choices. A finalized order collapses
   * everything into the resolved line items.
   */
  private getOrderChildren(order: Order): TreeNode[] {
    if (order.status === "finalized") {
      return [{ kind: "finalized-header" }];
    }

    const others = order.participants.filter(
      (p) => p.userId !== "current-user"
    );

    return [
      { kind: "my-wishlist-header" },
      { kind: "participants-header", count: others.length },
    ];
  }

  /** Returns the user's wishlist items followed by a persistent "Add item…" action node. */
  private getMyWishlistChildren(): TreeNode[] {
    const items = this.orderService.getMyWishlist();
    const nodes: TreeNode[] = items.map((item) => ({
      kind: "my-wishlist-item" as const,
      item,
    }));
    nodes.push({ kind: "add-item" });
    return nodes;
  }

  /** Lists other participants (excluding the current user) so the user can browse their picks. */
  private getParticipantNodes(order: Order): TreeNode[] {
    return order.participants
      .filter((p) => p.userId !== "current-user")
      .map((p) => ({
        kind: "participant" as const,
        name: p.name,
        items: p.wishlist,
      }));
  }

  /** Flattens the finalized order into display-ready lines with joined assignee names. */
  private getFinalizedLines(order: Order): TreeNode[] {
    if (!order.finalizedOrder) {
      return [];
    }
    return order.finalizedOrder.lines.map((line) => ({
      kind: "finalized-line" as const,
      menuName: formatMenuItem(line.menuItem),
      assignedTo: line.assignedTo.join(" + "),
    }));
  }
}

// MARK: Helpers

const { Expanded, Collapsed, None } = vscode.TreeItemCollapsibleState;

interface TreeItemOptions {
  icon: string;
  state?: vscode.TreeItemCollapsibleState;
  description?: string;
  contextValue?: string;
  command?: vscode.Command;
}

/** Convenience factory that reduces the repetitive TreeItem property assignments. */
function treeItem(label: string, opts: TreeItemOptions): vscode.TreeItem {
  const item = new vscode.TreeItem(label, opts.state);
  item.iconPath = new vscode.ThemeIcon(opts.icon);
  if (opts.description !== undefined) {
    item.description = opts.description;
  }
  if (opts.contextValue !== undefined) {
    item.contextValue = opts.contextValue;
  }
  if (opts.command !== undefined) {
    item.command = opts.command;
  }
  return item;
}

function formatMenuItem(menuItem: MenuItem): string {
  const portion = menuItem.isHalf ? " (half)" : " (whole)";
  return `${menuItem.name}${portion}`;
}

/** Renders desire as a 5-star string (e.g. "★★★☆☆") for compact inline display. */
function formatDesire(level: DesireLevel): string {
  return "\u2605".repeat(level) + "\u2606".repeat(5 - level);
}

/**
 * Shared factory for wishlist tree items. Both "my" items and other
 * participants' items display the same way (name + desire stars), but only
 * the user's own items carry a `contextValue` so VS Code shows the
 * remove action exclusively for those.
 */
function buildWishlistTreeItem(
  wishlistItem: WishlistItem,
  icon: string,
  contextValue?: string,
): vscode.TreeItem {
  const item = new vscode.TreeItem(formatMenuItem(wishlistItem.menuItem));
  item.description = formatDesire(wishlistItem.desireLevel);
  item.iconPath = new vscode.ThemeIcon(icon);
  if (contextValue) {
    item.contextValue = contextValue;
  }
  return item;
}
