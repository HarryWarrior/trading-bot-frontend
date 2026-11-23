# Feature template (`_template`)

Canonical feature module. **Every new frontend feature starts as a copy of this folder.**
Procedure: [`.agents/rules/new-feature.md`](../../.agents/rules/new-feature.md).

```
features/<feature>/
  api/          # <feature>Api.ts — ONLY place that talks to the backend (via useApiClient), maps DTOs
  types/        # view types (camelCase) mirroring backend contracts
  stores/       # Pinia setup store: state + actions, calls api/
  composables/  # use<Feature>() — what pages use
  components/   # <Feature>*.vue — auto-registered without path prefix
  index.ts      # public surface; other features import only from here
```

Flow: `page → composable → store → api → useApiClient → backend`.

Wiring (`nuxt.config.ts`): `features/*/components` are auto-registered components and
`features/*/{composables,stores}` are auto-imported.

Sample backend: `services/_template` in `Trading-bot-backend` (`/api/v1/template/items`).
