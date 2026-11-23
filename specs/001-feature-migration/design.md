# 001 — Migrate pages to feature modules (frontend design)

- **Status:** draft
- **Date:** 2026-11-23
- **Backend (source of truth):** `Trading-bot-backend/specs/001-service-migration/design.md`

## Intent

Follow the backend migration: move current pages, stores and components into feature modules that
call the new services through `useApiClient`, and add real authentication screens.

## Goals

- Features `auth`, `journal`, `analytics` created from `features/_template`.
- `stores/analytics.ts`, `stores/mt5.ts` and `components/Analytics/*` moved into features; no direct `$fetch`.
- Auth: sign-in/up, email verification, forgot/reset password using `AppAuthCard`; token stored in an
  auth store; `useApiClient` sends it; `UNAUTHENTICATED` redirects to login; route middleware for
  protected pages.
- Tooling: Vitest + `@nuxt/test-utils`, ESLint + Prettier, `vue-tsc` for `nuxi typecheck`.
- Fix number formatting (raw floats such as `27.272727…%` on the journal page).

## Non-goals

MT5 connection UI (002), strategies (003), AI journal (004).

## Open questions

- Token storage: httpOnly cookie via backend vs. memory + refresh? (decide with backend 001 auth design)
- Keep legacy `/upload` page or fold upload into the journal feature?

## Done when

All pages work against the gateway; no `$fetch` outside `useApiClient`; tests and build green.
