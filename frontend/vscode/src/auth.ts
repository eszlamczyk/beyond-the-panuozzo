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
 * 3. The received JWT and refresh token are persisted in
 *    {@link vscode.SecretStorage} and subsequent calls to
 *    {@link getSession} / {@link getToken} return the cached credentials.
 *    When the short-lived JWT expires, a refresh token is used to
 *    transparently obtain a new one.
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
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.secrets = context.secrets;
    this.extensionMode = context.extensionMode;
  }

  dispose() {
    this.clearRefreshTimer();
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

    const refreshToken = params.get("refresh_token");
    if (refreshToken) {
      await this.secrets.store(SecretKeys.RefreshToken, refreshToken);
    }

    this.cachedPayload = undefined;
    this._onDidChangeSession.fire();
    vscode.window.showInformationMessage("Signed in successfully.");

    const payload = this.decodeJwt(token);
    if (payload) {
      this.scheduleProactiveRefresh(payload);
    }
  }

  /** Opens the browser to initiate Google OAuth sign-in against the backend. */
  async signIn(): Promise<void> {
    const backendUrl = this.getBackendUrl();
    const callbackUri = this.getCallbackUri();

    const authUrl =
      `${backendUrl}${ApiPaths.AuthGoogle}?redirect_uri=${encodeURIComponent(callbackUri)}`;

    await vscode.env.openExternal(vscode.Uri.parse(authUrl));
  }

  /** Revokes server-side tokens, clears local storage, and notifies listeners. */
  async signOut(): Promise<void> {
    // Best-effort server-side revocation
    try {
      const token = await this.secrets.get(SecretKeys.Jwt);
      if (token) {
        const backendUrl = this.getBackendUrl();
        await fetch(`${backendUrl}${ApiPaths.AuthSignOut}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Best effort — ignore network errors
    }

    await this.clearTokens();
    this._onDidChangeSession.fire();
    vscode.window.showInformationMessage("Signed out.");
  }

  /**
   * Returns the current user's decoded JWT payload, or `undefined` if
   * not signed in. When the JWT has expired, transparently refreshes it
   * using the stored refresh token.
   */
  async getSession(): Promise<JwtPayload | undefined> {
    if (this.cachedPayload && !this.isExpired(this.cachedPayload)) {
      return this.cachedPayload;
    }

    const token = await this.secrets.get(SecretKeys.Jwt);
    if (token) {
      const payload = this.decodeJwt(token);
      if (payload && !this.isExpired(payload)) {
        this.cachedPayload = payload;
        this.scheduleProactiveRefresh(payload);
        return payload;
      }
    }

    // JWT is missing or expired — attempt refresh
    const refreshed = await this.refreshAccessToken();
    if (refreshed) {
      this.scheduleProactiveRefresh(refreshed);
      return refreshed;
    }

    // Refresh also failed — no valid session
    await this.clearTokens();
    return undefined;
  }

  /** Returns the cached user ID (`sub` claim) synchronously, or `""` if not signed in. */
  getUserId(): string {
    return this.cachedPayload?.sub ?? "";
  }

  /** Returns the raw JWT string if a valid session exists, otherwise `undefined`. */
  async getToken(): Promise<string | undefined> {
    const session = await this.getSession();
    if (!session) {
      return undefined;
    }
    return this.secrets.get(SecretKeys.Jwt);
  }

  /**
   * Attempts to obtain a new access JWT using the stored refresh token.
   * On success, stores the new JWT and refresh token and returns the decoded payload.
   * On failure, clears all tokens (unless the failure was a network error).
   */
  private async refreshAccessToken(): Promise<JwtPayload | undefined> {
    const refreshToken = await this.secrets.get(SecretKeys.RefreshToken);
    if (!refreshToken) {
      return undefined;
    }

    try {
      const backendUrl = this.getBackendUrl();
      const response = await fetch(`${backendUrl}${ApiPaths.AuthRefresh}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        // Refresh token is invalid/expired/revoked — clear everything
        await this.clearTokens();
        return undefined;
      }

      const data = (await response.json()) as {
        token: string;
        refresh_token: string;
      };

      await this.secrets.store(SecretKeys.Jwt, data.token);
      await this.secrets.store(SecretKeys.RefreshToken, data.refresh_token);

      const payload = this.decodeJwt(data.token);
      if (payload) {
        this.cachedPayload = payload;
      }
      return payload;
    } catch {
      // Network error — don't clear tokens, the refresh token may still be valid
      return undefined;
    }
  }

  /** Schedules a proactive token refresh 1 minute before the JWT expires. */
  private scheduleProactiveRefresh(payload: JwtPayload): void {
    this.clearRefreshTimer();
    const msUntilExpiry = payload.exp * 1000 - Date.now();
    const refreshIn = Math.max(msUntilExpiry - 60_000, 0);
    this.refreshTimer = setTimeout(async () => {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        this.scheduleProactiveRefresh(refreshed);
      }
    }, refreshIn);
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private async clearTokens(): Promise<void> {
    this.clearRefreshTimer();
    await this.secrets.delete(SecretKeys.Jwt);
    await this.secrets.delete(SecretKeys.RefreshToken);
    this.cachedPayload = undefined;
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
