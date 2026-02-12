import * as vscode from "vscode";
import { AuthService } from "./auth";
import { Commands } from "./constants";

/**
 * Discriminated union of nodes rendered in the Account tree view.
 *
 * - `sign-in`  – shown when unauthenticated; clicking triggers Google OAuth.
 * - `account`  – displays the signed-in user's name and email.
 * - `sign-out` – clicking clears the stored JWT and signs the user out.
 */
type AccountNode =
  | { kind: "sign-in" }
  | { kind: "account"; name: string; email: string }
  | { kind: "sign-out" };

/**
 * Tree data provider for the "Account" sidebar section.
 *
 * When the user is **not signed in**, the tree shows a single clickable
 * "Sign in with Google" item. Once authenticated it shows the user's
 * identity and a "Sign out" action.
 *
 * Call {@link refresh} (e.g. in response to {@link AuthService.onDidChangeSession})
 * to re-render after sign-in or sign-out.
 */
export class AccountTreeDataProvider
  implements vscode.TreeDataProvider<AccountNode>, vscode.Disposable
{
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly auth: AuthService) {}

  dispose(): void {
    this._onDidChangeTreeData.dispose();
  }

  /** Fires the change event so VS Code re-renders the tree. */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /** Converts an {@link AccountNode} into a VS Code tree item for display. */
  getTreeItem(node: AccountNode): vscode.TreeItem {
    switch (node.kind) {
      case "sign-in": {
        const item = new vscode.TreeItem("Sign in with Google");
        item.iconPath = new vscode.ThemeIcon("sign-in");
        item.command = {
          command: Commands.SignIn,
          title: "Sign in with Google",
        };
        return item;
      }

      case "account": {
        const item = new vscode.TreeItem(`Signed in as ${node.name}`);
        item.iconPath = new vscode.ThemeIcon("account");
        item.description = node.email;
        return item;
      }

      case "sign-out": {
        const item = new vscode.TreeItem("Sign out");
        item.iconPath = new vscode.ThemeIcon("sign-out");
        item.command = {
          command: Commands.SignOut,
          title: "Sign out",
        };
        return item;
      }
    }
  }

  /**
   * Returns the root-level nodes based on the current authentication state.
   * This is a flat list (no nesting), so the method ignores any parent element.
   */
  async getChildren(): Promise<AccountNode[]> {
    const session = await this.auth.getSession();
    if (!session) {
      return [{ kind: "sign-in" }];
    }
    return [
      { kind: "account", name: session.name, email: session.email },
      { kind: "sign-out" },
    ];
  }
}
