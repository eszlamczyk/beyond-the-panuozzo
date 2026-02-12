import * as vscode from "vscode";
import { OrderService } from "./order.service";
import { Commands } from "../constants";
import { DesireLevel, MenuItem } from "../types";

/**
 * Wires up all order-related VS Code commands so the rest of the extension
 * can trigger them by identifier without knowing the implementation details.
 *
 * Commands are registered on the extension context so they are automatically
 * disposed when the extension deactivates.
 */
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

/**
 * Guides the user through picking a menu item and a desire level, then adds
 * the selection to their wishlist.
 *
 * The two-step QuickPick flow (item → desire) exists because an order is
 * collaborative: participants express *preferences*, not hard commitments.
 * The desire rating lets the finalizer prioritize items that people actually
 * care about over ones added "just in case."
 *
 * Only draft orders accept new items — once an order is finalized the
 * selections are locked and this command bails out early.
 */
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

  const desireLabels: Record<DesireLevel, string> = {
    1: "1 - Meh, if others want it",
    2: "2 - Could be nice",
    3: "3 - I'd like it",
    4: "4 - Really want it",
    5: "5 - I need this in my life",
  };

  const desirePick = await vscode.window.showQuickPick(
    ([1, 2, 3, 4, 5] as DesireLevel[]).map((level) => ({
      label: desireLabels[level],
      level,
    })),
    { placeHolder: "How much do you want it?" }
  );

  if (!desirePick) {
    return;
  }

  await orderService.addItem({
    menuItem: picked.menuItem as MenuItem,
    desireLevel: desirePick.level,
  });
}

/** Removes an item from the user's wishlist. */
async function removeWishlistItem(
  orderService: OrderService,
  menuItemId: string
): Promise<void> {
  await orderService.removeItem(menuItemId);
}
