# 003 — Strategies, backtests, paper/live UI (frontend design)

- **Status:** draft
- **Date:** 2026-11-23
- **Backend (source of truth):** `Trading-bot-backend/specs/003-strategy-backtest-live/design.md`

## Intent

One place to go from a strategy to a backtest, to paper trading, to live money — with risk controls
always visible.

## Goals

- Feature `strategies`: list/create strategy versions and parameters.
- Backtest runs: launch, progress, results (KPIs reuse `AppMetricCard`, equity curve, trades list).
- Deployments: paper/live status, promotion gate checklist, explicit confirmation for live.
- Risk limits form per deployment; **global kill switch** always reachable from the header, with
  confirmation.

## Non-goals

Visual strategy builder, marketplace.

## Anti-goals

Any path that enables live trading without showing risk limits and requiring confirmation.

## Done when

The backend 003 scenario can be completed entirely from the UI.
