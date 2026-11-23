# 0001 — Feature modules with a single API client

- **Status:** accepted
- **Date:** 2026-11-23
- **Spec:** `specs/000-agents-foundation/`

## Context

The app grew as pages plus global stores that call `$fetch` directly, and each agent added code in a
different place. The backend is moving to many microservices; the UI needs to add features for each
without spreading HTTP details everywhere. Nuxt layers were considered (heavier, KISS rejects it now).

## Decision

- Each capability is a folder in `features/<feature>/` (`api`, `types`, `stores`, `composables`,
  `components`, `index.ts`), created by copying `features/_template`.
- Only `api/` files talk to the backend, through `composables/useApiClient.ts` (envelope unwrap,
  `ApiError`, auth header).
- Wired via Nuxt `components` and `imports.dirs`; shared UI stays in `components/Common/App*`.

## Consequences

- Predictable place for every piece of code; backend changes touch only `api/` files.
- Feature component names must be globally unique (feature prefix).
- Existing pages/stores must be migrated (frontend spec 001).
