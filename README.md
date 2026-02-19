# Beyond the Panuozzo

A monorepo for the Beyond the Panuozzo project, managed with [pnpm](https://pnpm.io/) and [Turborepo](https://turbo.build/).

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (v10+)
- [Docker](https://www.docker.com/) (for the database)

## Project Structure

```
btp-backend/        — NestJS backend API
frontend/
  admin/            — React admin panel (Vite)
  vscode/           — VSCode extension
packages/
  shared/           — Shared types and enums (@btp/shared)
```

## Getting Started

1. **Install dependencies** (from the repo root):

   ```bash
   pnpm install
   ```

2. **Start the database** (see [docker/README.md](docker/README.md)):

   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

3. **Run all projects in dev mode:**

   ```bash
   pnpm dev
   ```

## Common Commands

All commands are run from the repository root via Turborepo:

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies across workspaces |
| `pnpm dev` | Start all projects in development/watch mode |
| `pnpm build` | Build all projects |
| `pnpm lint` | Lint all projects |
| `pnpm test` | Run tests across all projects |

### Filtering by Package

Turborepo lets you target specific packages:

```bash
# Build only the shared package
pnpm turbo run build --filter=@btp/shared

# Dev mode for backend only
pnpm turbo run dev --filter=btp-backend

# Lint only the admin panel
pnpm turbo run lint:check --filter=admin
```

### Adding Dependencies

```bash
# Add a dependency to a specific workspace
pnpm add <package> --filter=btp-backend

# Add a dev dependency to a specific workspace
pnpm add -D <package> --filter=admin

# Add a dependency to the root (e.g. tooling)
pnpm add -Dw <package>
```

## Shared Package

The `@btp/shared` package (`packages/shared/`) contains types and enums shared across the backend, admin panel, and VSCode extension. It is referenced using the `workspace:*` protocol.

When you modify `@btp/shared`, Turborepo will automatically rebuild dependents thanks to the `"dependsOn": ["^build"]` configuration.
