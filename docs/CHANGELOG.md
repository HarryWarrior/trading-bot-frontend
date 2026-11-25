# Changelog - Trading Bot Frontend


## [Unreleased]

### Changed
- Frontend runs on the real services (auth, journal, analytics, mt5) through the dev proxy; real data only, no simulated trades, balances or candles.
- Pages are thin and compose `features/auth`, `journal`, `analytics`, `mt5-connection`, `market`; a global route guard requires a session.
- Analytics dashboard shows a loading state on retry and account switch; KPI money values are coloured by sign; the trade chart shows "No market data" when the trade is outside the loaded candles.
- MT5 connection: failed syncs refresh the account status; the admin view loads reactively; link/sync/unlink are guarded against double runs.
- Vitest is now real (`npx vitest run`); `npx nuxi typecheck` is clean for app code.

### Added
- MT5 EA bridge UI (spec 002) on `/mt5` for every signed-in user: generate ingest tokens (plaintext shown once in a copy modal, never stored), revoke them, download the EA ("EA not available yet" until it is published), setup steps incl. the MT5 Allow WebRequest whitelist URL, and bridge accounts with connected / last seen / last deal. The legacy admin-only terminal link stays in its own section.
- Dev proxy `/api/v1/mt5-bridge` → `NUXT_BRIDGE_URL` (default `http://localhost:8005`); `useApiClient().getBlob` for authenticated downloads.
- `AGENTS.md`, `.agents/rules/`, `.agents/templates/`: single source of rules for AI agents (replaces `.gemini/rules`).
- `features/_template` feature module and `composables/useApiClient.ts` (envelope unwrap, `ApiError`).
- `docs/`: architecture, features catalog, ADR 0001; `specs/`: workflow and drafts 001-004.

### Removed
- Unused `AppAuthCard`; the landing page no longer mentions demo data.
- `docs/project-spec.md`, `docs/tech-spec.md` (folded into `docs/architecture.md` and `.agents/rules/`).
- `TROUBLESHOOTING-DATOS.md` (obsolete debugging notes for the old data-loading issue).

---

## [1.1.0] - Dub.co Design System & Reusable UI Component Library 🎨

### ✨ Features
* **Modern SaaS / Dub.co Design Tokens:**
  * Injected full `zinc` neutral palette, micro-borders (`1px`), and soft multi-layered shadows (`shadow-card`, `shadow-subtle`, `shadow-modal`) in `tailwind.config.js`.
  * Added global utility classes in `assets/css/main.css` for standardized buttons (`.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-subtle`) and micro-border cards (`.dub-card`).
* **Reusable UI Component Library (`components/Common/`):**
  * `<AppButton>`: Multi-variant button primitive with size scales, loading spinner, and icon slots.
  * `<AppInput>`: Form input with labels, error hints, micro-borders, and **mandatory interactive eye password visibility toggle (`👁️` / `🙈`)**.
  * `<AppBadge>`: Status and indicator badge with live pulse dot support.
  * `<AppMetricCard>`: Institutional KPI card with tooltips and percentage delta indicators.
  * `<AppModal>`: Accessible backdrop-blurred modal dialog with `Escape` key handling.
  * `<AppConfirmDeleteModal>`: Double-confirmation modal with typed confirmation safeguard.
  * `<AppEmptyState>`: Dashed-border empty state container with CTA button.
  * `<AppHeader>`: Workstation header with workspace switcher, `⌘K` search trigger, and i18n switcher.
  * `<AppSidebar>`: Workstation navigation sidebar with usage progress meter.
  * `<AppAuthCard>`: Multi-mode Login/Register form with OAuth and password checklist.
* **Theme Management (Dark / Light Mode):**
  * Created `composables/useTheme.ts` with local storage persistence and root class toggling.
  * Added `<AppThemeToggle>` component with Sun/Moon Lucide icons and smooth transitions across all main pages and headers.
* **Iconography Standardization:**
  * Adopted [Lucide Icons](https://lucide.dev/icons/) (`lucide-vue-next`) as the single, universal icon system across all UI primitives and views.
* **Documentation & Architecture:**
  * Updated `AGENTS.md`, `docs/project-spec.md`, `docs/tech-spec.md`, and `docs/README.md` with the new design system contracts, Lucide Icons directives, and component specifications.

## [1.0.0] - Initial Release & Analytics Suite 📊

### ✨ Features
* **Interactive Dashboard:**
  * High-performance KPI cards (Total Profit, Win Rate, Profit Factor, Max Drawdown, Best Streak).
  * Dynamic Equity Curve chart powered by Plotly.js (`EquityCurveChart.vue`).
  * Calendar performance heatmap (`CalendarHeatmap.vue`).
  * Real-time filtered trades table (`TradesTable.vue`) with symbol, status, and date range filters.
* **File Ingestion:**
  * Drag & Drop file uploader (`upload.vue`) supporting MT5 CSV and Excel reports with client-side validation.
* **Advanced Charting & Comparison:**
  * Multi-trade comparison modal (`BacktestingCompareModal.vue`) with 1x1, 2x1, 2x2 grid views.
  * TradingView Lightweight Charts candlestick viewer (`TradeChartModal.vue`).
* **State & Architecture:**
  * Pinia store (`stores/analytics.ts`) managing API synchronization, loading states, and error handling.
  * TypeScript type definitions (`types/analytics.ts` and `types/analytics.extended.ts`).
  * Dark theme financial terminal styling with Tailwind CSS.
