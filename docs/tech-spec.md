# Technical Specification (Tech Spec) - Trading Bot Frontend

> **Purpose:** This technical specification serves as the implementation blueprint for AI coding agents and frontend developers building, optimizing, and extending the Trading Bot Frontend web application.

---

## 1. System Architecture & Directory Layout

The application is built on **Nuxt 3** using the **Vue 3 Composition API (`<script setup lang="ts">`)**, **Pinia State Management**, and **Tailwind CSS**:

```
trading-bot-frontend/
├── app.vue                         # Root application shell and global head metadata
├── nuxt.config.ts                 # Nuxt modules, runtime config, and meta definition
├── tailwind.config.js              # Theme extension, color tokens, and responsive breakpoints
├── pages/
│   ├── index.vue                   # Marketing and navigation landing page
│   ├── upload.vue                  # MT5 report dropzone and file ingestion interface
│   └── journal.vue                 # Analytical dashboard, KPI cards, charts, and trades table
├── components/
│   ├── Analytics/
│   │   ├── KpiCard.vue             # Metric card with trend icon and percentage changes
│   │   ├── EquityCurveChart.vue    # Plotly.js time-series balance chart
│   │   ├── CalendarHeatmap.vue     # Monthly/daily performance calendar heatmap
│   │   ├── TradesTable.vue         # Paginated, filtered trade execution table
│   │   ├── BacktestingCompareModal # Multi-trade comparison modal (1x1, 2x1, 2x2 grids)
│   │   └── TradeChartModal.vue     # TradingView Lightweight Charts modal
│   └── Common/
│       ├── AppButton.vue           # Universal button primitive with variants & loading state
│       ├── AppInput.vue            # Accessible input with mandatory eye password toggle
│       ├── AppBadge.vue            # Semantic status & indicator pill
│       ├── AppMetricCard.vue       # Institutional KPI card with tooltips & delta badges
│       ├── AppModal.vue            # Accessible modal dialog with backdrop blur
│       ├── AppConfirmDeleteModal.vue # Destructive action double-confirmation dialog
│       ├── AppEmptyState.vue       # Dashed empty state placeholder with CTA
│       ├── AppHeader.vue           # Global workstation header (Workspace, Search, Avatar)
│       ├── AppSidebar.vue          # Navigation sidebar with usage meter
│       ├── AppAuthCard.vue         # Multi-mode Login/Register card with OAuth
│       ├── AppPagination.vue       # Standardized pagination & page size controller
│       ├── AppSkeleton.vue         # Placeholder skeletons for loading states
│       └── AppTooltip.vue          # Floating definition & KPI tooltip
├── stores/
│   ├── analytics.ts                # Pinia store for analytics, trades, and file uploads
│   └── i18n.ts                     # Pinia multi-language store (English / Spanish)
├── composables/
│   ├── useAnalytics.ts             # Analytics lifecycle and fetch abstractions
│   ├── useTradeComparison.ts       # Multi-chart comparison state and keyboard navigation
│   └── useI18n.ts                  # Reactive internationalization composable
├── types/
│   ├── analytics.ts                # Core Trade, Analytics, DailyStat, MonthlyStat interfaces
│   └── analytics.extended.ts       # TradeComparison, ViewMode, ComparisonStats interfaces
└── assets/
    └── css/main.css                # Global CSS styles, Tailwind directives, custom scrollbars
```

---

## 2. Technology Stack & Key Libraries

* **Core Framework:** Nuxt `3.8.0` / Vue `3.3.0`
* **TypeScript:** Version `5.3.0` (Strict mode enabled)
* **Iconography:** [Lucide Icons](https://lucide.dev/icons/) (`lucide-vue-next 0.344.0`)
* **State Management:** Pinia `2.1.0` via `@pinia/nuxt`
* **Styling Framework:** Tailwind CSS `3.3.0` with `@nuxtjs/tailwindcss`
* **Visualization Engines:**
  * **Plotly.js:** `plotly.js-dist-min 2.26.0` (Dynamic SSR-safe import for equity & drawdown curves).
  * **Lightweight Charts:** `lightweight-charts 5.0.9` (Financial candlestick and volume visualization).
* **HTTP Client:** Nuxt Native `$fetch` (Powered by `ofetch`).

---

## 3. State Management & Store Contracts

### 3.1 Analytics Store (`stores/analytics.ts`)

* **State:**
  * `analytics: Ref<Analytics | null>`
  * `trades: Ref<Trade[]>`
  * `loading: Ref<boolean>`
  * `error: Ref<string | null>`
* **Core Actions:**
  * `fetchAnalytics()`: Calls `GET /api/v1/analytics/summary` using `useRuntimeConfig().public.apiBaseUrl`.
  * `fetchTrades(filters)`: Calls `GET /api/v1/analytics/filter` with query parameters.
  * `uploadTrades(file)`: Sends `FormData` payload to `POST /api/v1/analytics/upload-trades` and triggers full state re-fetch.
* **Getters:** `sortedTrades`, `winningTrades`, `losingTrades`, `totalProfit`, `winRate`, `profitFactor`.

### 3.2 Internationalization Store (`stores/i18n.ts`)

* **State:**
  * `currentLocale: Ref<'en' | 'es'>`
  * `translations: Record<string, Record<string, string>>`
* **Action:**
  * `setLocale(locale: 'en' | 'es')`: Switches language dictionary reactively.
  * `t(key: string)`: Translates key path (e.g., `t('kpi.win_rate')`).

---

## 4. Backend Integration Contract

All backend communication connects to the FastAPI backend via configured runtime variables:

```typescript
// nuxt.config.ts
runtimeConfig: {
  public: {
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    apiVersion: process.env.NUXT_PUBLIC_API_VERSION || 'v1'
  }
}
```

### Endpoints Consumed by Frontend:
1. `POST /api/v1/analytics/upload-trades` (Multipart file upload)
2. `GET /api/v1/analytics/summary` (Full analytics payload)
3. `GET /api/v1/analytics/filter` (Filtered trades list)
4. `GET /api/v1/analytics/timeseries` (Plotly equity curves)
5. `GET /api/v1/analytics/hourly-heatmap` (Hourly distribution)

---

## 5. Charting & Visualization Specifications

### 5.1 EquityCurveChart Component
* **Rendering Strategy:** Plotly.js is loaded dynamically inside `renderChart()` to prevent Server-Side Rendering (SSR) hydration mismatch errors:
  ```typescript
  const Plotly = await import('plotly.js-dist-min')
  Plotly.newPlot('equity-chart', [trace], layout, config)
  ```
* **Styling Tokens:** Emerald line (`#10b981`), semi-transparent area fill (`rgba(16, 185, 129, 0.1)`), dark canvas background (`rgba(31, 41, 55, 0.5)`).

### 5.2 Lightweight Candlestick Charts (`TradeChartModal.vue`)
* Built with `createChart()` from `lightweight-charts`.
* Auto-sizes to container dimensions using `ResizeObserver`.
* Supports `addCandlestickSeries()` for OHLCV data.

---

## 6. UI Standards & Reusable Component Specifications

### 6.1 Action Buttons Standard (`<AppButton>`)
* **Props:** `variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'subtle'`, `size: 'xs' | 'sm' | 'md' | 'lg'`, `loading: boolean`, `disabled: boolean`, `block: boolean`.
* **Slots:** `default` (label), `startIcon`, `endIcon`.

### 6.2 Form Inputs Standard (`<AppInput>`)
* **Props:** `modelValue: string | number`, `label: string`, `type: string`, `placeholder: string`, `error: string`, `hint: string`, `required: boolean`, `disabled: boolean`.
* **Password Eye Toggle:** Automatically rendered for `type="password"` with accessible ARIA toggle button.

### 6.3 Metric & KPI Cards (`<AppMetricCard>`)
* **Props:** `title: string`, `value: string | number`, `delta: number | string`, `isPositive: boolean`, `tooltip: string`, `subtitle: string`.
* **Slots:** `badge`, `footer`.

### 6.4 Modals & Dialogs (`<AppModal>`, `<AppConfirmDeleteModal>`)
* **`<AppModal>`:** Teleported to `<body>`, handles `Escape` key and backdrop dismissal.
* **`<AppConfirmDeleteModal>`:** Enforces double-confirmation via exact typed string match before emitting `@confirm`.

### 6.5 Tooltip Specification (`<AppTooltip>`)
* **Props:** `text: string`, `title?: string`.
* Displays a floating dark tooltip positioned above the target with a smooth fade transition.


---

## 7. Build, Validation & Quality Standards

* **Dev Server:** `npm run dev` (Runs Nuxt Vite on `http://localhost:3000`).
* **Type Checking:** `npx nuxi typecheck` (Validates all TypeScript interfaces).
* **Production Build:** `npm run build` (Builds Nitro output for Node/Vercel/Docker deployment).
