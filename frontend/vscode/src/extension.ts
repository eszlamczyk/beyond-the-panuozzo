import * as vscode from "vscode";
import { AuthService } from "./auth";
import { AccountTreeDataProvider } from "./account-tree-provider";
import { MockOrderClient } from "./api/mock-client";
import { OrderService } from "./orders/order.service";
import { OrderTreeDataProvider } from "./orders/order-tree-provider";
import { registerOrderCommands } from "./orders/commands";
import { Commands, Views } from "./constants";

/** Called by VS Code when the extension is activated. */
export function activate(context: vscode.ExtensionContext): void {
  const auth = new AuthService(context);
  const accountTree = new AccountTreeDataProvider(auth);

  // Order system
  const orderClient = new MockOrderClient(() => auth.getUserId());
  const orderService = new OrderService(orderClient, auth);
  const orderTree = new OrderTreeDataProvider(orderService);

  // Auth wiring
  registerOAuthHandler(context, auth);
  registerAuthCommands(context, auth);

  // Order wiring
  registerOrderCommands(context, orderService);

  // Sync auth context key and refresh trees on changes
  const updateAuthContext = async () => {
    const session = await auth.getSession();
    await vscode.commands.executeCommand(
      "setContext", "btp.signedIn", !!session
    );
    accountTree.refresh();
    orderTree.refresh();
  };
  context.subscriptions.push(
    auth.onDidChangeSession(() => updateAuthContext()),
    orderService.onDidChange(() => orderTree.refresh())
  );
  updateAuthContext();

  // Notifications
  context.subscriptions.push(showOrderNotifications(orderClient));

  // Register tree views
  context.subscriptions.push(
    vscode.window.createTreeView(Views.Explorer, {
      treeDataProvider: orderTree,
    }),
    vscode.window.createTreeView(Views.Account, {
      treeDataProvider: accountTree,
    }),
    auth,
    { dispose: () => orderClient.dispose() },
    orderService
  );

  // Load initial order state
  orderService.initialize();
}

function registerOAuthHandler(
  context: vscode.ExtensionContext,
  auth: AuthService
) {
  context.subscriptions.push(vscode.window.registerUriHandler(auth));
}

function registerAuthCommands(
  context: vscode.ExtensionContext,
  auth: AuthService
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.SignIn, () => auth.signIn()),
    vscode.commands.registerCommand(Commands.SignOut, () => auth.signOut())
  );
}

function showOrderNotifications(orderClient: MockOrderClient) {
  return orderClient.onOrderEvent((event) => {
    if (event.type === "created") {
      vscode.window.showInformationMessage(
        `New panuozzo order! Add your wishlist items.`
      );
    } else if (event.type === "finalized") {
      vscode.window.showInformationMessage(
        `Order #${event.order.id} has been finalized! Check the sidebar for results.`
      );
    }
  });
}

/** Called by VS Code when the extension is deactivated. Currently a no-op. */
export function deactivate() {}
