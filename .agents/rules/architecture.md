# Frontend architecture

The frontend mirrors the backend's hexagonal idea: UI and state depend on a feature's `api/` module
(the outbound adapter), never on HTTP details.

## Layers

| Layer | Location | Responsibility | May use |
|---|---|---|---|
| Page | `pages/*.vue` | Route, layout, compose features | feature `index.ts`, `components/Common` |
| Component | `features/<f>/components/` | Render and emit events | its composable, `components/Common` |
| Composable | `features/<f>/composables/` | Public API of the feature for pages/components | its store |
| Store | `features/<f>/stores/` | State, loading/error, actions | its `api/` |
| API | `features/<f>/api/` | Call backend via `useApiClient`, map DTO ↔ view types | `useApiClient`, its `types/` |
| Types | `features/<f>/types/` | View types (camelCase) | — |
| Shared UI | `components/Common/App*` | Design-system primitives | nothing feature-specific |
| Shared HTTP | `composables/useApiClient.ts` | Base URL, auth header, envelope unwrap, `ApiError` | Nuxt `$fetch` |

```
page → composable → store → api → useApiClient → gateway /api/v1/<service>
```

## Dependency rules

- A feature never imports another feature's internals — only its `index.ts`.
- `components/Common` never imports from `features/`.
- Only `api/` files import `useApiClient`; only `useApiClient` calls `$fetch`.
- One feature per backend capability; it may call several services, each through its own `api/` file.

```ts
// Good — page uses the feature's public surface
import { useTemplateItems } from '~/features/_template'

// Bad — component fetching directly
const data = await $fetch('/api/v1/journal/trades')
```

## Wiring (nuxt.config.ts)

- `components`: `~/components` (with path prefix) and `~/features/*/components/**` (no prefix, so
  component names must start with the feature name: `JournalTradeTable.vue`).
- `imports.dirs`: `features/*/composables`, `features/*/stores` are auto-imported.

## Principles

- **SRP:** components render, stores hold state, api maps transport.
- **OCP:** new backend service = new `api/` file; components do not change.
- **DIP:** components depend on composables, not on HTTP.
- **KISS:** no extra abstraction until a second use exists.
