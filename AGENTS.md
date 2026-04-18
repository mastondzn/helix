# AGENTS.md

TypeScript library wrapping the Twitch Helix API. Uses a Proxy-based client to provide typed API access with minimal bundle size.

## Commands

```bash
# Install dependencies (uses pnpm, version pinned in packageManager field)
pnpm install

# Generate types from Twitch OpenAPI schema (required before build/test)
pnpm generate

# Full CI check (run in this order)
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test

# Single test file
pnpm test --run tests/error.test.ts

# All tests
pnpm test --run

# Typecheck only (no emit)
pnpm typecheck

# Format code (excludes pnpm-lock.yaml)
pnpm format
```

## Architecture

- **Entry**: `src/index.ts` exports `createHelixClient()` and generated types
- **Proxy core**: `src/proxy.ts` - recursive Proxy that builds API paths dynamically
- **Generated types**: `src/helix.generated.ts` - OpenAPI-generated types (770KB, do not edit)
- **Build output**: `dist/*.mjs` + `dist/*.d.mts` (unbundled, preserves file structure)

## Key Patterns

- API paths accessed via chained property access: `helix.users.get({ query: {...} })`
- HTTP methods are the final property: `.get()`, `.post()`, etc.
- CamelCase paths auto-convert to snake_case for API (e.g., `customRewards` → `custom_rewards`)
- Generated types from [twitch-api-swagger](https://github.com/DmitryScaletta/twitch-api-swagger)

## Tooling

- **Package manager**: pnpm (version in `packageManager` field)
- **Linter**: ESLint with `@mastondzn/eslint` config
- **Formatter**: Prettier, 4-space tabs, 100 print width
- **Builder**: `tsdown` with `--unbundle` flag
- **Test**: Vitest
- **TypeScript**: ES2025, strict mode, bundler module resolution

## Build Notes

- `pnpm build` runs `generate` automatically but CI runs them separately
- Build is unbundled (outputs individual `.mjs` files)
- Generated file is excluded from linting via `eslint.config.js`

## Release

- Triggered on `v*` tags or manual workflow dispatch
- CI must pass before release (enforced by `wait-on-check-action`)
- Uses `bumpp` for versioning, `changelogithub` for release notes
