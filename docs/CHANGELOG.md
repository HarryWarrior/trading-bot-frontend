# Changelog - Trading Bot Frontend

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
