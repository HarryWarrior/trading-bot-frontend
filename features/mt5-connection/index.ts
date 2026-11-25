/** Public surface of the feature. Other features and pages import only from here. */
export { mt5Api } from './api/mt5Api'
export { mt5ErrorKey, MT5_ERROR_CODES } from './composables/mt5Errors'
export { resolveMt5View, formatStatusMoney, formatStatusTime } from './composables/mt5View'
export { mt5Messages } from './composables/messages'
export { useMt5ConnectionStore } from './stores/mt5Connection'
export { default as Mt5ConnectionPanel } from './components/Mt5ConnectionPanel.vue'
export type { Mt5Account, AccountStatus, SyncResult } from './types'
