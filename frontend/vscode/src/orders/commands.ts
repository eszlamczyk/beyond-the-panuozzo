import * as vscode from "vscode";
import { OrderService } from "./order.service";
import { Commands } from "../constants";
import { MenuItem } from "../types";

export function registerOrderCommands(
  context: vscode.ExtensionContext,
  orderService: OrderService
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Commands.AddWishlistItem,
      () => addWishlistItem(orderService)
    ),
    vscode.commands.registerCommand(
      Commands.RemoveWishlistItem,
      (node: { item: { menuItem: { id: string } } }) =>
        removeWishlistItem(orderService, node.item.menuItem.id)
    )
  );
}

async function addWishlistItem(orderService: OrderService): Promise<void> {
  const order = await orderService.getOrder();
  if (!order || order.status !== "draft") {
    vscode.window.showWarningMessage("No active draft order.");
    return;
  }

  const menu = await orderService.getMenu();

  const picked = await vscode.window.showQuickPick(
    menu.map((m) => ({
      label: m.name,
      description: m.isHalf ? "(half)" : "(whole)",
      menuItem: m,
    })),
    { placeHolder: "Select a panuozzo" }
  );

  if (!picked) {
    return;
  }

  await orderService.addItem({
    menuItem: picked.menuItem as MenuItem,
    quantity: 1,
  });
}

async function removeWishlistItem(
  orderService: OrderService,
  menuItemId: string
): Promise<void> {
  await orderService.removeItem(menuItemId);
}
