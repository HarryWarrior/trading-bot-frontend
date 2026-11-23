# AGENTS.md — Trading Platform Frontend

Entry point for every AI agent (Claude, Codex, Gemini, …) and human contributor.
Read this file first, then the rule files linked below that apply to your task.

## 1. Product

A **multi-user SaaS of trading tools**, usable privately or offered as a service. This repo is the web
app (Nuxt 3). The backend is `Trading-bot-backend`: hexagonal microservices behind a gateway
(`/api/v1/<service>`). Its `AGENTS.md` describes the full product vision; intent for any feature lives
in the backend spec with the same number.

Users connect their trading accounts once; executions arrive automatically (MT5 EA bridge), get
analyzed and journaled (also by AI), and strategies go from backtest to paper to live trading.

## 2. Current vs target state

| Area | Today | Target |
|---|---|---|
| Structure | Pages + global `components/`, `stores/`, `composables/` | Feature modules in `features/<feature>/` |
| Backend access | Stores call `$fetch` directly | Feature `api/` modules via `useApiClient` |
| Backend | Legacy monolith endpoints (`/api/v1/analytics`, `/mt5`, `/auth`) | Service endpoints through the gateway (spec 001) |

Existing `pages/`, `components/Analytics/`, `stores/`, `composables/` are **legacy until frontend
spec 001** migrates them. New features always go in `features/`.

## 3. Tech stack

Nuxt 3 · Vue 3 (`<script setup lang="ts">`) · TypeScript strict · Pinia · Tailwind CSS · Lucide icons
(`lucide-vue-next`) · Plotly.js (equity/drawdown) · Lightweight Charts (candles) · Vitest *(planned, spec 001)*.

## 4. Repository map

```
AGENTS.md  CLAUDE.md  GEMINI.md     # agent entry points
.agents/rules/  .agents/templates/  # how we build; spec/ADR templates
features/_template/                 # canonical feature module: COPY THIS for new features
features/<feature>/                 # api/ types/ stores/ composables/ components/ index.ts
components/Common/App*.vue          # shared design-system primitives (only shared UI lives here)
composables/useApiClient.ts         # base HTTP client: base URL, auth header, envelope, ApiError
pages/                              # thin route components composing features
components/Analytics/ stores/ composables/ types/   # legacy, migrated by spec 001
docs/  specs/                       # architecture, catalog, ADRs; design/plan per piece of work
```

## 5. Run & build

```bash
npm install
npm run dev            # http://localhost:3000 — needs backend on NUXT_PUBLIC_API_BASE_URL (default http://localhost:8000)
npm run build          # must pass before every commit that touches code
npx nuxi typecheck     # requires vue-tsc (planned)
```

Do not run `npm run build` while `npm run dev` is running: both write `.nuxt/` and the dev server breaks.

## 6. Golden rules

1. **Feature modules:** new functionality = copy `features/_template` (see `.agents/rules/new-feature.md`).
2. **Only `api/` talks to the backend**, always through `useApiClient`. No `$fetch` in components or stores.
3. **Shared UI only from `components/Common/App*`.** Do not create a second button/modal/input.
4. **Pages are thin:** compose features; no business logic, no data fetching code.
5. **Backend contract:** unwrap the envelope in `useApiClient`; branch on `ApiError.code`, never on messages.
6. **English only** in code, identifiers and translation keys; user-facing text via i18n (en/es).
7. **UI standards** (`.agents/rules/ui-standards.md`): skeletons, empty states, tooltips on metrics,
   P&L colors, confirmation before deletes, 300 ms debounce on search.
8. **Spec before non-trivial work** (`specs/`), linked to the backend spec of the same number.
9. **Docs tell the truth:** mark *(planned)*; update `docs/features-catalog.md` with the change.
10. **Never push to `main` or `dev` directly**; work on a feature branch.

## 7. How work is done

Same workflow as the backend: design (approved) → plan → execute → verify (`npm run build`, run the
page) → update docs → `done`. See `.agents/rules/docs-and-specs.md`.

## 8. Rules index

| File | Read when |
|---|---|
| [architecture.md](.agents/rules/architecture.md) | Any change: where code goes |
| [new-feature.md](.agents/rules/new-feature.md) | Creating a feature |
| [vue-style.md](.agents/rules/vue-style.md) | Writing Vue/TypeScript |
| [ui-standards.md](.agents/rules/ui-standards.md) | Building UI |
| [api-client.md](.agents/rules/api-client.md) | Calling the backend |
| [state.md](.agents/rules/state.md) | Stores and composables |
| [testing.md](.agents/rules/testing.md) | Tests |
| [git-workflow.md](.agents/rules/git-workflow.md) | Branches, commits, PRs |
| [docs-and-specs.md](.agents/rules/docs-and-specs.md) | Specs, ADRs, docs |

## 9. Glossary

Trading terms (deal, position, PnL, drawdown, profit factor, payoff, EA bridge, ingest token, paper/live)
are defined in the backend `AGENTS.md` §9. UI-specific: **KPI card** = `AppMetricCard`; **feature** =
a folder in `features/` owning one capability's UI.
