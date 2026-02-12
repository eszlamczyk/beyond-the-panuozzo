import * as vscode from "vscode";
import { OrderService } from "./order.service";
import { Commands } from "../constants";
import { DesireLevel, MenuItem } from "../types";

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

async function removeWishlistItem(
  orderService: OrderService,
  menuItemId: string
): Promise<void> {
  await orderService.removeItem(menuItemId);
}
