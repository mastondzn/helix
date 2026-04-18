# AGENTS.md

TypeScript library wrapping the Twitch Helix API. Uses a Proxy-based client to provide typed API access with minimal bundle size.

## Commands

```bash
# Install dependencies (uses pnpm, version pinned in packageManager field)
pnpm install

# Generate types from Twitch OpenAPI schema (required before build/test)
pnpm generate

# Full CI check (run in this order)
pnpm generate
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
pnpm test --run

# Single test file
pnpm test --run tests/error.test.ts

# Typecheck only (no emit)
pnpm typecheck

# Format code (excludes pnpm-lock.yaml)
pnpm format
```

**Important**: `pnpm test` without `--run` starts Vitest in watch mode. Always use `--run` in CI or non-interactive contexts.

## Architecture

- **Entry**: `src/index.ts` exports `createHelixClient()` and generated types
- **Proxy core**: `src/proxy.ts` — recursive Proxy that builds API paths dynamically. No actual object structure exists; paths are resolved at call time.
- **Generated types**: `src/helix.generated.ts` — OpenAPI-generated from remote Twitch swagger spec (~770KB, do not edit)
- **Build output**: `dist/*.mjs` + `dist/*.d.mts` (unbundled, preserves file structure)
- **Tests**: `tests/` directory (not co-located with source)

## Key Patterns

- API paths accessed via chained property access: `helix.users.get({ query: {...} })`
- HTTP methods are the final property: `.get()`, `.post()`, etc.
- CamelCase paths auto-convert to snake_case for API (e.g., `customRewards` → `custom_rewards`)
- Never specify `method` in the init object — it's derived from the final property name
- `.url` returns the built URL without making a request

## Tooling

- **Package manager**: pnpm (version in `packageManager` field)
- **Linter**: ESLint with `@mastondzn/eslint` config (`ts/no-empty-object-type` is disabled)
- **Formatter**: Prettier, 4-space tabs, 100 print width
- **Builder**: `tsdown` with `--unbundle` flag
- **Test**: Vitest
- **TypeScript**: ES2025, strict mode, bundler module resolution, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`

## Constraints

- ESM only (`"type": "module"` in package.json)
- `pnpm build` does not run `generate` automatically
- Only the maintainer should update and commit `src/helix.generated.ts` (via `pnpm generate`) — do not edit/generate manually
- Generated file is excluded from linting via `eslint.config.js`

## Release

- Triggered on `v*` tags or manual workflow dispatch
- CI must pass before release (enforced by `wait-on-check-action`)
- Uses `bumpp` for versioning (`pnpm release`), `changelogithub` for release notes
- Publish uses `pnpm publish --no-git-checks` (OIDC provenance enabled)
