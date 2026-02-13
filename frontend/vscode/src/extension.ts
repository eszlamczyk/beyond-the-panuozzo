import * as vscode from "vscode";
import { AuthService } from "./auth";
import { AccountTreeDataProvider } from "./account-tree-provider";
import type { IOrderClient } from "./api/client";
import { MockOrderClient } from "./api/mock-client";
import { SseOrderClient } from "./api/sse-client";
import { OrderService } from "./orders/order.service";
import { OrderTreeDataProvider } from "./orders/order-tree-provider";
import { registerOrderCommands } from "./orders/commands";
import { BackendUrl, Commands, Config, Views } from "./constants";

/** Called by VS Code when the extension is activated. */
export function activate(context: vscode.ExtensionContext): void {
  const auth = new AuthService(context);
  const accountTree = new AccountTreeDataProvider(auth);

  // Order system — use real SSE client unless running in test mode
  const orderClient = createOrderClient(context, auth);
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

    // Manage SSE connection lifecycle based on auth state
    if (orderClient instanceof SseOrderClient) {
      if (session) {
        await orderClient.connect();
      } else {
        orderClient.disconnect();
      }
    }
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
    accountTree,
    orderTree,
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

function showOrderNotifications(orderClient: IOrderClient) {
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

function createOrderClient(
  context: vscode.ExtensionContext,
  auth: AuthService,
): IOrderClient {
  if (context.extensionMode === vscode.ExtensionMode.Test) {
    return new MockOrderClient(() => auth.getUserId());
  }

  const backendUrl = resolveBackendUrl(context.extensionMode);
  return new SseOrderClient(backendUrl, () => auth.getToken());
}

function resolveBackendUrl(mode: vscode.ExtensionMode): string {
  if (mode === vscode.ExtensionMode.Production) {
    return BackendUrl.Production;
  }
  const config = vscode.workspace.getConfiguration(Config.Section);
  return config.get<string>(Config.BackendUrl, BackendUrl.Development);
}

/** Called by VS Code when the extension is deactivated. Currently a no-op. */
export function deactivate() {}
