import * as vscode from "vscode";

const TOKEN_KEY = "btp.jwt";

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  exp: number;
}

export class AuthService implements vscode.UriHandler, vscode.Disposable {
  private readonly _onDidChangeSession = new vscode.EventEmitter<void>();
  readonly onDidChangeSession = this._onDidChangeSession.event;

  private secrets: vscode.SecretStorage;
  private cachedPayload: JwtPayload | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.secrets = context.secrets;
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

    await this.secrets.store(TOKEN_KEY, token);
    this.cachedPayload = undefined;
    this._onDidChangeSession.fire();
    vscode.window.showInformationMessage("Signed in successfully.");
  }

  async signIn(): Promise<void> {
    const config = vscode.workspace.getConfiguration("btp");
    const backendUrl = config.get<string>("backendUrl", "http://localhost:3000");
    const callbackUri = this.getCallbackUri();

    const authUrl =
      `${backendUrl}/auth/google?redirect_uri=${encodeURIComponent(callbackUri)}`;

    await vscode.env.openExternal(vscode.Uri.parse(authUrl));
  }

  async signOut(): Promise<void> {
    await this.secrets.delete(TOKEN_KEY);
    this.cachedPayload = undefined;
    this._onDidChangeSession.fire();
    vscode.window.showInformationMessage("Signed out.");
  }

  async getSession(): Promise<JwtPayload | undefined> {
    if (this.cachedPayload && !this.isExpired(this.cachedPayload)) {
      return this.cachedPayload;
    }

    const token = await this.secrets.get(TOKEN_KEY);
    if (!token) {
      return undefined;
    }

    const payload = this.decodeJwt(token);
    if (!payload || this.isExpired(payload)) {
      await this.secrets.delete(TOKEN_KEY);
      this.cachedPayload = undefined;
      return undefined;
    }

    this.cachedPayload = payload;
    return payload;
  }

  async getToken(): Promise<string | undefined> {
    const session = await this.getSession();
    if (!session) {
      return undefined;
    }
    return this.secrets.get(TOKEN_KEY);
  }

  private getCallbackUri(): string {
    const extension = vscode.extensions.getExtension("eszlamczyk.beyond-the-panuozzo");
    if (extension) {
      return `${vscode.env.uriScheme}://eszlamczyk.beyond-the-panuozzo/auth`;
    }
    // Fallback for development (extension ID may differ)
    return `${vscode.env.uriScheme}://eszlamczyk.beyond-the-panuozzo/auth`;
  }

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

  private isExpired(payload: JwtPayload): boolean {
    return payload.exp * 1000 < Date.now();
  }
}
