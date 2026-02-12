import * as vscode from "vscode";
import { OrderService } from "./order.service";
import { Commands } from "../constants";
import { DesireLevel, MenuItem, Order, WishlistItem } from "../types";

function formatDesire(level: DesireLevel): string {
  return "\u2605".repeat(level) + "\u2606".repeat(5 - level);
}

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

function formatMenuItem(menuItem: MenuItem): string {
  const portion = menuItem.isHalf ? " (half)" : " (whole)";
  return `${menuItem.name}${portion}`;
}

/** Visible only when signed in (gated by `btp.signedIn` context key). */
export class OrderTreeDataProvider
  implements vscode.TreeDataProvider<TreeNode>
{
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly orderService: OrderService) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(node: TreeNode): vscode.TreeItem {
    switch (node.kind) {
      case "no-order": {
        const item = new vscode.TreeItem("No active order");
        item.iconPath = new vscode.ThemeIcon("package");
        return item;
      }

      case "order-header": {
        const label =
          node.order.status === "draft"
            ? `Order #${node.order.id} (Draft)`
            : `Order #${node.order.id} (Finalized)`;
        const item = new vscode.TreeItem(
          label,
          vscode.TreeItemCollapsibleState.Expanded
        );
        item.iconPath = new vscode.ThemeIcon("package");
        return item;
      }

      case "my-wishlist-header": {
        const item = new vscode.TreeItem(
          "My Wishlist",
          vscode.TreeItemCollapsibleState.Expanded
        );
        item.iconPath = new vscode.ThemeIcon("checklist");
        return item;
      }

      case "my-wishlist-item":
        return buildWishlistTreeItem(node.item, "circle-filled", "wishlistItem");

      case "add-item": {
        const item = new vscode.TreeItem("Add item...");
        item.iconPath = new vscode.ThemeIcon("add");
        item.command = {
          command: Commands.AddWishlistItem,
          title: "Add item to wishlist",
        };
        return item;
      }

      case "participants-header": {
        const item = new vscode.TreeItem(
          `Participants (${node.count})`,
          vscode.TreeItemCollapsibleState.Collapsed
        );
        item.iconPath = new vscode.ThemeIcon("organization");
        return item;
      }

      case "participant": {
        const item = new vscode.TreeItem(
          node.name,
          node.items.length > 0
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None
        );
        item.iconPath = new vscode.ThemeIcon("person");
        item.description = `${node.items.length} item(s)`;
        return item;
      }

      case "participant-item":
        return buildWishlistTreeItem(node.item, "circle-outline");

      case "finalized-header": {
        const item = new vscode.TreeItem(
          "Final Order",
          vscode.TreeItemCollapsibleState.Expanded
        );
        item.iconPath = new vscode.ThemeIcon("tasklist");
        return item;
      }

      case "finalized-line": {
        const item = new vscode.TreeItem(node.menuName);
        item.description = node.assignedTo;
        item.iconPath = new vscode.ThemeIcon("arrow-right");
        return item;
      }
    }
  }

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

  private getMyWishlistChildren(): TreeNode[] {
    const items = this.orderService.getMyWishlist();
    const nodes: TreeNode[] = items.map((item) => ({
      kind: "my-wishlist-item" as const,
      item,
    }));
    nodes.push({ kind: "add-item" });
    return nodes;
  }

  private getParticipantNodes(order: Order): TreeNode[] {
    return order.participants
      .filter((p) => p.userId !== "current-user")
      .map((p) => ({
        kind: "participant" as const,
        name: p.name,
        items: p.wishlist,
      }));
  }

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
