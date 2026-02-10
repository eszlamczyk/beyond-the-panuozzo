import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard';
import { GoogleUser } from './google.strategy';

/**
 * Handles the Google OAuth 2.0 login flow requests.
 *
 * Flow:
 * 1. Client visits `GET /auth/google?redirect_uri=<whitelisted_uri>[&state=<opaque>]`.
 * 2. The {@link GoogleAuthGuard} validates the redirect URI, encodes it into
 *    Google's `state` parameter, and redirects the browser to Google's consent screen.
 * 3. After the user authenticates, Google redirects back to
 *    `GET /auth/google/callback?code=…&state=…`.
 * 4. The callback exchanges the code for a user profile, generates a JWT,
 *    and redirects the browser to `<redirect_uri>?token=<jwt>[&state=<opaque>]`.
 *
 * For non-HTTP redirect URIs (e.g. `vscode://…`) the callback serves an HTML
 * page that triggers the custom-scheme link via JavaScript, so the browser tab
 * does not hang on an unresolvable redirect.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Initiates the Google OAuth flow.
   *
   * The method body is intentionally empty because the {@link GoogleAuthGuard}
   * intercepts the request before this method executes: it validates the
   * `redirect_uri`, encodes it into the OAuth `state` parameter, and issues a
   * 302 redirect to Google's consent screen. The browser never reaches this
   * method body — it only exists so NestJS registers the route.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {}

  /**
   * Handles Google's OAuth callback. Exchanges the authorization code for a
   * user profile, generates a JWT, and redirects the browser to the original
   * client redirect URI with the token attached as a query parameter.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(
    @Req() req: Request,
    @Query('state') state: string,
    @Res() res: Response,
  ): void {
    const user = req.user as GoogleUser;
    const { redirectUri, clientState } = this.authService.decodeState(state);

    if (!this.authService.validateRedirectUri(redirectUri)) {
      throw new BadRequestException('Invalid redirect_uri in state.');
    }

    const token = this.authService.generateJwt(user);

    const url = new URL(redirectUri);
    url.searchParams.set('token', token);
    if (clientState) {
      url.searchParams.set('state', clientState);
    }

    const targetUrl = url.toString();

    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      res.redirect(targetUrl);
      return;
    }

    res.type('html').send(buildRedirectPage(targetUrl));
  }
}

/**
 * Builds an HTML page that triggers a custom-scheme redirect (e.g. `vscode://…`)
 * via JavaScript and provides a manual fallback link. This avoids the browser
 * tab hanging on an unresolvable redirect.
 */
function buildRedirectPage(targetUrl: string): string {
  const safeUrl = escapeHtml(targetUrl);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Authentication successful</title></head>
<body>
  <p>Authentication successful. Opening your application&hellip;</p>
  <p>If nothing happens, <a id="link" href="${safeUrl}">click here</a>.</p>
  <p>You can close this tab.</p>
  <script>window.location.href=${JSON.stringify(targetUrl)};</script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
