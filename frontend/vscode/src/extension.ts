import * as vscode from "vscode";
import { AuthService } from "./auth";

class BtpTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly auth: AuthService) {}

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const session = await this.auth.getSession();

    if (!session) {
      const signIn = new vscode.TreeItem("Sign in with Google");
      signIn.iconPath = new vscode.ThemeIcon("sign-in");
      signIn.command = {
        command: "btp.signIn",
        title: "Sign in with Google",
      };
      return [signIn];
    }

    const user = new vscode.TreeItem(`Signed in as ${session.name}`);
    user.iconPath = new vscode.ThemeIcon("account");
    user.description = session.email;

    const signOut = new vscode.TreeItem("Sign out");
    signOut.iconPath = new vscode.ThemeIcon("sign-out");
    signOut.command = {
      command: "btp.signOut",
      title: "Sign out",
    };

    return [user, signOut];
  }
}

export function activate(context: vscode.ExtensionContext) {
  const auth = new AuthService(context);
  const treeDataProvider = new BtpTreeDataProvider(auth);

  // Register URI handler for OAuth callback
  context.subscriptions.push(vscode.window.registerUriHandler(auth));

  // Refresh tree when auth state changes
  context.subscriptions.push(
    auth.onDidChangeSession(() => treeDataProvider.refresh())
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("btp.signIn", () => auth.signIn()),
    vscode.commands.registerCommand("btp.signOut", () => auth.signOut())
  );

  // Register tree view
  const treeView = vscode.window.createTreeView("btp-explorer", {
    treeDataProvider,
  });
  context.subscriptions.push(treeView, auth);
}

export function deactivate() {}
