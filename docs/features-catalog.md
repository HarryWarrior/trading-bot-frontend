# Features catalog

Status: `active` · `in-progress` · `planned`.

| Feature | Purpose | Status | Backend services | Spec |
|---|---|---|---|---|
| `_template` | Canonical feature module to copy | active | `template` | [000](../specs/000-agents-foundation/design.md) |
| `auth` | Sign-in/up, verify email, reset password, session | active | `auth` | [001](../specs/001-feature-migration/design.md) |
| `journal` | Trades list, filters, upload, trade detail | active | `journal` | [001](../specs/001-feature-migration/design.md) |
| `analytics` | KPIs, equity, heatmaps | active | `analytics` | [001](../specs/001-feature-migration/design.md) |
| `mt5-connection` | EA bridge for every user: ingest tokens (shown once, revoke), EA download, setup guide (Allow WebRequest), bridge accounts with connected / last seen / last deal. Legacy: link/sync/unlink the open MT5 terminal (admin only) | active (bridge: in-progress, EA file pending backend Task 7) | `mt5-bridge`, `mt5` | [002](../specs/002-mt5-connection-ui/design.md) |
| `market` | Real candles for the trade chart ("No market data" when unavailable) | active | `mt5` | [001](../specs/001-feature-migration/design.md) |
| `strategies` | Strategies, backtests, paper/live, risk, kill switch | planned | `strategies`, `backtester`, `execution` | [003](../specs/003-strategies-ui/design.md) |
| `ai-journal` | Journal entries, AI annotations, API/MCP tokens | planned | `journal`, `journal-ai`, `auth` | [004](../specs/004-ai-journal-ui/design.md) |
