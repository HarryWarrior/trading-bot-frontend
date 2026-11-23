# 002 — MT5 connection UI (frontend design)

- **Status:** draft
- **Date:** 2026-11-23
- **Backend (source of truth):** `Trading-bot-backend/specs/002-mt5-ea-bridge-sync/design.md`

## Intent

Make connecting an MT5 account a guided, few-minute task, and make sync status obvious — the EA
setup step is the main risk of users giving up.

## Goals

- Feature `mt5-connection`: generate ingest token (shown once, copy button), list/revoke tokens.
- EA download + step-by-step guide (allow WebRequest URL, attach EA, paste token) with screenshots.
- Accounts list: login, server, status (connected / last seen / last deal), balance/equity from heartbeat.
- Replace the legacy MT5 password modal (`Mt5ConnectModal.vue`): we never ask for broker passwords.

## Non-goals

Order execution UI (003).

## Open questions

Distribution of the EA (download vs. MQL5 Market) — decided in backend 002.

## Done when

A user connects a demo account following only the in-app guide and sees trades appear in the journal.
