import * as vscode from "vscode";
import { AuthService } from "./auth";
import { Commands, Views } from "./constants";

/**
 * Tree data provider for the "Beyond the Panuozzo" explorer sidebar panel.
 */
class BtpTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly auth: AuthService) {}

  /** Fires the change event so VS Code re-renders the tree. */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const session = await this.auth.getSession();
    return session
      ? this.getAuthenticatedChildren(session)
      : this.getUnauthenticatedChildren();
  }

  private getUnauthenticatedChildren(): vscode.TreeItem[] {
    const signIn = new vscode.TreeItem("Sign in with Google");
    signIn.iconPath = new vscode.ThemeIcon("sign-in");
    signIn.command = {
      command: Commands.SignIn,
      title: "Sign in with Google",
    };
    return [signIn];
  }

  private getAuthenticatedChildren(session: {
    name: string;
    email: string;
  }): vscode.TreeItem[] {
    const user = new vscode.TreeItem(`Signed in as ${session.name}`);
    user.iconPath = new vscode.ThemeIcon("account");
    user.description = session.email;

    const signOut = new vscode.TreeItem("Sign out");
    signOut.iconPath = new vscode.ThemeIcon("sign-out");
    signOut.command = {
      command: Commands.SignOut,
      title: "Sign out",
    };

    return [user, signOut];
  }
}

/** Called by VS Code when the extension is activated. */
export function activate(context: vscode.ExtensionContext): void {
  const auth = new AuthService(context);
  const treeDataProvider = new BtpTreeDataProvider(auth);

  registerOAuthHandler(context, auth);
  refreshTreeOnAuthChange(context, auth, treeDataProvider);
  registerCommands(context, auth);
  registerTreeView(context, treeDataProvider, auth);
}

function registerOAuthHandler(
  context: vscode.ExtensionContext,
  auth: AuthService
) {
  context.subscriptions.push(vscode.window.registerUriHandler(auth));
}

function refreshTreeOnAuthChange(
  context: vscode.ExtensionContext,
  auth: AuthService,
  treeDataProvider: BtpTreeDataProvider
) {
  context.subscriptions.push(
    auth.onDidChangeSession(() => treeDataProvider.refresh())
  );
}

function registerCommands(
  context: vscode.ExtensionContext,
  auth: AuthService
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.SignIn, () => auth.signIn()),
    vscode.commands.registerCommand(Commands.SignOut, () => auth.signOut())
  );
}

function registerTreeView(
  context: vscode.ExtensionContext,
  treeDataProvider: BtpTreeDataProvider,
  auth: AuthService
) {
  const treeView = vscode.window.createTreeView(Views.Explorer, {
    treeDataProvider,
  });
  context.subscriptions.push(treeView, auth);
}

/** Called by VS Code when the extension is deactivated. Currently a no-op. */
export function deactivate() {}
