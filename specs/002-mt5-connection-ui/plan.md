# 002 — MT5 connection UI Implementation Plan

**Goal:** Every signed-in user can connect an MT5 account through the EA bridge from `/mt5`: generate an ingest token, download the EA, follow the setup guide and see the account's sync status.
**Architecture:** `features/mt5-connection` gains `api/bridge.ts` (mt5-bridge service via `useApiClient`), the `mt5Bridge` store, the `useMt5Bridge` composable and `Mt5Bridge*` components. The legacy admin-only terminal link (`mt5Api.ts`, `Mt5ConnectionPanel`) is unchanged and shown in its own section of the page.
**Spec:** `specs/002-mt5-connection-ui/design.md` (backend: `Trading-bot-backend/specs/002-mt5-ea-bridge-sync/`, Task 6)

## Global constraints

- Backend is the source of truth: `/api/v1/mt5-bridge` `POST/GET /tokens`, `DELETE /tokens/{id}`, `GET /accounts`, `GET /ea/download`.
- Token plaintext is returned once by `POST /tokens`; the UI keeps it in memory only until the copy modal closes, never in storage.
- Account `status` is computed by the backend (`connected` = heartbeat in the last 5 min).
- `GET /ea/download` answers `404 NOT_FOUND` until the EA is built: show "EA not available yet", not an error.
- Available to all users; admin-only applies only to the legacy terminal link.
- i18n en/es, English keys (`mt5b.*`); dev proxy `NUXT_BRIDGE_URL` (default `http://localhost:8005`).

## Review focus

- Plaintext shown once, cleared on dismiss and on sign-out/user change, never persisted (store tests).
- EA missing (404 envelope delivered as a Blob) → unavailable state, other failures → error (api + store tests).
- `/api/v1/mt5-bridge` must not be caught by the `/api/v1/mt5` proxy prefix (Nitro registers reverse-sorted routes; config test).

---

### Task 1: Bridge api, store and binary download

**Files:**
- Create: `features/mt5-connection/api/bridge.ts`, `features/mt5-connection/stores/mt5Bridge.ts`
- Modify: `features/mt5-connection/types/index.ts`, `composables/useApiClient.ts` (`getBlob`)
- Test: `tests/unit/mt5-connection/bridgeApi.spec.ts`, `tests/unit/mt5-connection/bridgeStore.spec.ts`, `tests/unit/useApiClient.spec.ts`

**Interfaces:**
- Produces: `bridgeApi.{createToken, listTokens, revokeToken, listAccounts, downloadEa}`, `toIngestToken`, `toBridgeAccount`, `toBridgePagination`, `EA_FILE_NAME`; `useMt5BridgeStore` (`createdPlaintext`, `dismissCreatedToken`, `eaUnavailable`, …); `useApiClient().getBlob`.

- [x] **Step 1:** Failing tests: mappers (pagination, status), create-once plaintext, revoke, download unavailable/blob error envelope.
- [x] **Step 2:** Implement; `npx vitest run` → PASS.

### Task 2: Components, page, i18n, proxy, docs

**Files:**
- Create: `features/mt5-connection/composables/{bridgeView,useMt5Bridge}.ts`, `features/mt5-connection/components/Mt5Bridge{Panel,TokenPanel,TokenModal,EaDownload,AccountList,SetupSteps}.vue`
- Modify: `pages/mt5.vue`, `features/mt5-connection/{index.ts,composables/messages.ts}`, `nuxt.config.ts`, `docs/*`, `AGENTS.md`
- Test: `tests/unit/mt5-connection/bridgeUi.spec.ts` (proxy entry, docs, helpers, i18n, source-level component assertions)

- [x] **Step 1:** Failing tests; **Step 2:** implement; **Step 3:** `npx vitest run`, `npx nuxi typecheck`, `npm run build` → green. Commit `feat(mt5-connection): ingest token and EA bridge UI`.

## Rulings

- Task 1: `useApiClient` had no binary path — added `getBlob` (same auth/refresh path; Blob error bodies parsed back into `ApiError`) — cost if wrong: one more method on the shared client.
- Task 1: lists load one page of 100 (backend max) — a user has a handful of tokens/accounts — cost if wrong: tokens beyond 100 not listed (add `AppPagination`).
- Task 2: `.vue` files cannot be mounted in this Vitest config — components are covered by source-level assertions plus store/helper tests — cost if wrong: template regressions caught only by build/typecheck or manual check.
- Task 2: whitelist URL = `NUXT_PUBLIC_API_BASE_URL` origin, or the app origin when the API is same-origin — cost if wrong: the EA must be told the right `ApiUrl` once the gateway/EA contract (backend Task 7) is final.
