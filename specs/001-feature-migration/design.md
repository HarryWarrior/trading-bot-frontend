# 001 — Real data only: login and feature modules (frontend design)

- **Status:** approved (2026-11-23)
- **Date:** 2026-11-23
- **Backend (source of truth):** `Trading-bot-backend/specs/001-service-migration/design.md`
- **Branch:** `feat/001-real-data`

## Intent

The web app shows only real data of the signed-in user, and says so plainly when something is
unavailable. No demo data, no random candles, no invented balances.

## Goals

1. **Login:** pages `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`
   using `AppAuthCard`/`AppInput`; global route middleware sends signed-out users to `/login`;
   `UNAUTHENTICATED` from the API → refresh once, else to `/login`.
   Tokens: access token in memory + refresh token in `localStorage` (KISS; XSS risk accepted and
   documented until a cookie-based flow is specified).
2. **Feature modules** from `features/_template`: `auth`, `journal` (trades table, upload), `analytics`
   (KPIs, equity, heatmaps), `mt5-connection` (link terminal account, status, sync).
   `stores/analytics.ts`, `stores/mt5.ts` and their direct `$fetch` calls are removed.
3. **Real data only:** delete `Math.random` candle generation in `TradeChartMini.vue` /
   `TradeChartModal.vue`; candles come from `/api/v1/mt5/rates`, else an empty state "No market data".
   No invented stop loss / take profit (shown only if the trade has them).
4. **MT5 UI:** "Link MT5 account" shows the account the open terminal reports (login, server, demo/real,
   balance) and asks to confirm; no password field. Clear states: terminal not running, other
   account open, synced N trades.
5. **Correct display:** numbers rounded (2 dp), `null` drawdown % shown as "—", language consistent
   (i18n en/es everywhere, including modals).
6. Header/sidebar (`AppHeader`, `AppSidebar`) with user menu and sign-out.
7. Tooling: Vitest + `@nuxt/test-utils` for api mappers, stores and guards; `vue-tsc` for typecheck.

## Non-goals

OAuth buttons (hidden), several MT5 accounts at once, strategies, AI journal.

## Anti-goals

Any value on screen that did not come from the API; any page reachable without login (except auth pages).

## Done when

The backend "done when" scenarios work from the browser; `grep Math.random` finds nothing outside
`AppInput` ids; build, typecheck and Vitest green.
