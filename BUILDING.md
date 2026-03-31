# Building Civitas-ID

This guide covers setting up the project for local development and contributing.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 10.30+

## Getting Started

```bash
# Clone the repository (or download and extract the zip)
git clone https://github.com/crippledgeek/civitas-id.git
cd civitas-id

# Install dependencies and build all packages
pnpm install
```

The `prepare` lifecycle script runs `pnpm run build` automatically after install, so all workspace packages are built and ready to use immediately.

## Project Structure

This is a pnpm workspace monorepo with two publishable packages:

```
civitas-id/
├── packages/
│   ├── core/     — @deathbycode/civitas-id-core (shared interfaces and utilities)
│   └── sweden/   — @deathbycode/civitas-id-sweden (Swedish ID validation)
├── package.json          — root scripts and dev dependencies
└── pnpm-workspace.yaml   — workspace configuration
```

The `sweden` package depends on `core` via the `workspace:*` protocol. pnpm links them automatically during install.

## Scripts

All scripts are run from the repository root.

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies and build all packages |
| `pnpm run build` | Build all packages |
| `pnpm run test` | Run all tests |
| `pnpm run coverage` | Run tests with coverage report |
| `pnpm run lint` | Lint with Biome |

Per-package scripts can be run with `pnpm --filter`:

```bash
pnpm --filter @deathbycode/civitas-id-core test
pnpm --filter @deathbycode/civitas-id-sweden test
```

## Type Checking

```bash
pnpm -r exec tsc --noEmit
```

## Build Tooling

- **Bundler**: [tsup](https://tsup.egoist.dev/) (esbuild-based, ESM-only output)
- **Linter**: [Biome](https://biomejs.dev/)
- **Test runner**: [Vitest](https://vitest.dev/)
- **Coverage**: [@vitest/coverage-v8](https://vitest.dev/guide/coverage)

## Workspace Dependencies

The `core` package must be built before `sweden` can resolve its types. This is handled automatically:

- `pnpm install` triggers the `prepare` script which builds all packages
- `pnpm run build` uses `pnpm -r build` which respects the dependency graph

If you see `Cannot find module '@deathbycode/civitas-id-core'`, run `pnpm run build` to rebuild.

## CI

CI runs on every push and pull request to `develop` and `master`. It executes:

1. `pnpm install` (which builds via `prepare`)
2. `pnpm run lint`
3. `pnpm run test`
