/** Command identifiers – must match the `contributes.commands` entries in package.json. */
export const Commands = {
  SignIn: "btp.signIn",
  SignOut: "btp.signOut",
  AddWishlistItem: "btp.addWishlistItem",
  RemoveWishlistItem: "btp.removeWishlistItem",
} as const;

/** View / container identifiers – must match `contributes.views` in package.json. */
export const Views = {
  Explorer: "btp-explorer",
  Account: "btp-account",
} as const;

/** Backend server URLs per environment. */
export const BackendUrl = {
  Development: "http://localhost:3000",
  Production: "https://example.com",
} as const;

/** Configuration section and keys – must match `contributes.configuration` in package.json. */
export const Config = {
  Section: "btp",
  BackendUrl: "backendUrl",
} as const;

/** Extension identity – must match `publisher` and `name` in package.json. */
export const ExtensionId = "eszlamczyk.beyond-the-panuozzo" as const;

/** Secret-storage keys. */
export const SecretKeys = {
  Jwt: "btp.jwt",
} as const;

/** Backend API paths. */
export const ApiPaths = {
  AuthGoogle: "/auth/google",
  OrderEvents: "/orders/events",
} as const;

/** Internal extension hyperlink paths */
export const InternalPaths = {
  OAuthCallback: "/auth",
}
