# Changelog - Trading Bot Frontend

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
