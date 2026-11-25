/** Public surface of the feature. Pages import only from here. */
export { analyticsApi } from './api/analyticsApi'
export { useAnalyticsDashboardStore } from './stores/analyticsDashboard'
export { buildKpis, formatPercent, formatRatio } from './composables/kpi'
export { default as AnalyticsDashboard } from './components/AnalyticsDashboard.vue'
export type { Summary, EquityPoint, DayStat, SymbolStat, HourStat } from './types'
