# BTP Backend

NestJS backend API for Beyond the Panuozzo.

## Project Setup

Dependencies are managed from the monorepo root. See the [root README](../README.md) for general setup instructions.

```bash
# from the repo root
pnpm install
```

## Environment Variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret from Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | The callback URL registered in Google Console (default: `http://localhost:3000/auth/google/callback`) |
| `JWT_SECRET` | Secret key used to sign JWTs. Use a long random string |
| `ALLOWED_REDIRECT_URIS` | Comma-separated list of URIs the auth flow is allowed to redirect to after login (e.g. `vscode://eszlamczyk.beyond-the-panuozzo/auth,http://localhost:3000/callback`) |

## Running

```bash
# development (watch mode)
pnpm turbo run dev --filter=btp-backend

# production mode
pnpm turbo run build --filter=btp-backend
node dist/src/main
```

## Tests

```bash
# unit tests
pnpm turbo run test --filter=btp-backend

# e2e tests (run from this directory)
pnpm test:e2e

# test coverage
pnpm test:cov
```

## Migrations

```bash
# generate a new migration
pnpm migration:generate --name=MigrationName

# run pending migrations
pnpm migration:run

# revert the last migration
pnpm migration:revert
```
