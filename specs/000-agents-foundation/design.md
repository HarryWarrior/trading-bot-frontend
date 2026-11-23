# 000 — Agents Foundation, frontend (design)

- **Status:** in-progress (approved 2026-11-23)
- **Date:** 2026-11-23
- **Main design (source of truth for intent, constraints, workflow):**
  `Trading-bot-backend/specs/000-agents-foundation/design.md`
- **Branch:** `feat/agents-foundation`, created from `origin/dev`

## 1. Intent

Same as the backend spec: one set of agent rules, one feature template, one docs layout and one
spec workflow, so every agent adds UI features the same way. The frontend is the SaaS web app on
top of the backend microservices.

## 2. Scope of this spec

In: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agents/`, `docs/`, `specs/`, a working
`features/_template/`, Nuxt config wiring. Out: moving existing pages/components (frontend spec 001).

## 3. Agent files

```
AGENTS.md  CLAUDE.md (@AGENTS.md)  GEMINI.md
.agents/
  rules/
    architecture.md      # feature modules, dependency rule, where code goes
    new-feature.md       # copy features/_template, rename, add page/route, spec
    vue-style.md         # <script setup lang="ts">, strict TS, naming, English only, no trivial comments
    ui-standards.md      # merged from .gemini/rules/frontend_rules.md (pagination, buttons, debounce,
                         # tooltips, skeletons, P&L formatting, i18n en/es, dark theme, Lucide icons)
    api-client.md        # typed client per feature, envelope/error handling, auth header, base URL
    state.md             # Pinia setup stores per feature, no cross-feature store mutation
    testing.md           # Vitest for composables/stores/api clients; component tests where logic exists
    git-workflow.md      # same policy as backend
    docs-and-specs.md    # same workflow as backend, shared spec numbers
  templates/  (spec/, adr.md)
```
`.gemini/` is removed after merging.

## 4. Target structure

```
features/
  _template/
    components/      # feature-specific components (prefix with feature name)
    composables/     # use<Feature>…
    stores/          # Pinia setup store
    api/             # <feature>Api.ts — the ONLY place that calls the backend (outbound adapter)
    types/           # DTOs mirroring backend contracts + view models
    index.ts         # public surface of the feature
components/Common/App*   # shared design-system primitives (only shared UI lives here)
composables/useApiClient.ts  # base $fetch wrapper: base URL, auth header, envelope unwrap, errors
pages/               # thin: compose features, no business logic
```
**Dependency rule:** `pages → features → (Common, useApiClient)`. A feature never imports another
feature's internals, only its `index.ts`. Components never call `$fetch` directly.

## 5. Docs

`docs/README.md`, `docs/architecture.md` (current vs target, how it talks to the gateway),
`docs/features-catalog.md`, `docs/adr/`, `CHANGELOG.md` (kept). `project-spec.md`/`tech-spec.md`
folded and translated as in the backend.

## 6. Specs (frontend counterparts, `draft`)

- **001** Migrate pages/stores to feature modules; adopt `useApiClient` + envelope; auth screens.
- **002** MT5 connection UI: generate/revoke ingest token, download EA, setup guide, live sync status.
- **003** Strategies, backtest results, paper/live promotion with risk limits and kill switch.
- **004** Journal entries with AI: notes/tags/screenshots on executions; MCP/API token management.

## 7. Done when

Files above committed on `feat/agents-foundation` (not pushed); `npm run build` passes with
`features/_template` wired; `.gemini/` removed; no rule duplicated.
