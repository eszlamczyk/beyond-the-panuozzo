import * as vscode from "vscode";
import { ApiPaths, BackendUrl, Config, ExtensionId, InternalPaths, SecretKeys } from "./constants";

/**
 * Decoded JWT token payload containing user identity and expiration.
 */
interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
}

/**
 * Manages OAuth-based authentication for the VS Code extension.
 *
 * Implements the full sign-in flow:
 * 1. {@link signIn} opens the browser to the backend's Google OAuth endpoint.
 * 2. After successful authentication the backend redirects back to a
 *    `vscode://` URI, which VS Code routes to {@link handleUri}.
 * 3. The received JWT is persisted in {@link vscode.SecretStorage} and
 *    subsequent calls to {@link getSession} / {@link getToken} return
 *    the cached credentials until they expire.
 *
 * Subscribe to {@link onDidChangeSession} to react to sign-in / sign-out
 * events (e.g. to refresh UI state).
 */
export class AuthService implements vscode.UriHandler, vscode.Disposable {
  private readonly _onDidChangeSession = new vscode.EventEmitter<void>();

  /** Fires whenever the user signs in or signs out. */
  readonly onDidChangeSession = this._onDidChangeSession.event;

  private secrets: vscode.SecretStorage;
  private cachedPayload: JwtPayload | undefined;
  private extensionMode: vscode.ExtensionMode;

  constructor(context: vscode.ExtensionContext) {
    this.secrets = context.secrets;
    this.extensionMode = context.extensionMode;
  }

  dispose() {
    this._onDidChangeSession.dispose();
  }

  /** Called by VSCode when a vscode://<publisher>.<name>/... URI is opened. */
  async handleUri(uri: vscode.Uri): Promise<void> {
    const params = new URLSearchParams(uri.query);
    const token = params.get("token");
    if (!token) {
      vscode.window.showErrorMessage("Authentication failed: no token received.");
      return;
    }

    await this.secrets.store(SecretKeys.Jwt, token);
    this.cachedPayload = undefined;
    this._onDidChangeSession.fire();
    vscode.window.showInformationMessage("Signed in successfully.");
  }

  /** Opens the browser to initiate Google OAuth sign-in against the backend. */
  async signIn(): Promise<void> {
    const backendUrl = this.getBackendUrl();
    const callbackUri = this.getCallbackUri();

    const authUrl =
      `${backendUrl}${ApiPaths.AuthGoogle}?redirect_uri=${encodeURIComponent(callbackUri)}`;

    await vscode.env.openExternal(vscode.Uri.parse(authUrl));
  }

  /** Deletes the stored JWT and notifies listeners of the session change. */
  async signOut(): Promise<void> {
    await this.secrets.delete(SecretKeys.Jwt);
    this.cachedPayload = undefined;
    this._onDidChangeSession.fire();
    vscode.window.showInformationMessage("Signed out.");
  }

  /**
   * Returns the current user's decoded JWT payload, or `undefined` if
   * not signed in or the token has expired. Expired tokens are automatically
   * removed from secret storage.
   */
  async getSession(): Promise<JwtPayload | undefined> {
    if (this.cachedPayload && !this.isExpired(this.cachedPayload)) {
      return this.cachedPayload;
    }

    const token = await this.secrets.get(SecretKeys.Jwt);
    if (!token) {
      return undefined;
    }

    const payload = this.decodeJwt(token);
    if (!payload || this.isExpired(payload)) {
      await this.secrets.delete(SecretKeys.Jwt);
      this.cachedPayload = undefined;
      return undefined;
    }

    this.cachedPayload = payload;
    return payload;
  }

  /** Returns the raw JWT string if a valid session exists, otherwise `undefined`. */
  async getToken(): Promise<string | undefined> {
    const session = await this.getSession();
    if (!session) {
      return undefined;
    }
    return this.secrets.get(SecretKeys.Jwt);
  }

  /** Resolves the backend base URL — production URL in production mode, configurable in development. */
  private getBackendUrl(): string {
    if (this.extensionMode === vscode.ExtensionMode.Production) {
      return BackendUrl.Production;
    }
    const config = vscode.workspace.getConfiguration(Config.Section);
    return config.get<string>(Config.BackendUrl, BackendUrl.Development);
  }

  /** Builds the `vscode://` callback URI the backend redirects to after OAuth. */
  private getCallbackUri(): string {
    return `${vscode.env.uriScheme}://${ExtensionId}${InternalPaths.OAuthCallback}`;
  }

  /** Decodes the base64url-encoded payload of a JWT without verifying the signature. */
  private decodeJwt(token: string): JwtPayload | undefined {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return undefined;
      }
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      if (!payload.sub || !payload.exp) {
        return undefined;
      }
      return payload as JwtPayload;
    } catch {
      return undefined;
    }
  }

  /** Returns `true` if the token's `exp` claim is in the past. */
  private isExpired(payload: JwtPayload): boolean {
    return payload.exp * 1000 < Date.now();
  }
}
