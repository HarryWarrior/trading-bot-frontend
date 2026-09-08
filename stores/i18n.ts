import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Locale = 'en' | 'es'

export const useI18nStore = defineStore('i18n', () => {
  const currentLocale = ref<Locale>('en')

  const translations: Record<Locale, Record<string, string>> = {
    en: {
      // General Navigation & Hero
      'app.title': 'Trading Bot Analytics',
      'app.subtitle': 'Professional portfolio intelligence and quantitative trade analytics',
      'nav.home': 'Home',
      'nav.journal': 'Trading Journal',
      'nav.upload': 'Upload Report',
      'nav.connect_mt5': 'Connect MetaTrader',
      'nav.compare': 'Compare Trades',

      // Actions & Buttons
      'actions.connect': 'Connect Account',
      'actions.sync': 'Sync Deals',
      'actions.syncing': 'Syncing...',
      'actions.upload': 'Upload Trades',
      'actions.filter': 'Filter',
      'actions.reset': 'Reset',
      'actions.close': 'Close',
      'actions.cancel': 'Cancel',
      'actions.confirm': 'Confirm',
      'actions.delete': 'Delete',
      'actions.save': 'Save',
      'actions.show_password': 'Show password',
      'actions.hide_password': 'Hide password',

      // MT5 Integration
      'mt5.connect_title': 'Connect MetaTrader 5 Account',
      'mt5.connect_subtitle': 'Link your broker account to stream deals and candlestick rates automatically',
      'mt5.account_name': 'Account Name / Label',
      'mt5.server': 'Broker Server',
      'mt5.login': 'Account Login ID',
      'mt5.password': 'Investor (Read-only) Password',
      'mt5.broker': 'Broker Name',
      'mt5.status_connected': 'Connected',
      'mt5.status_syncing': 'Syncing...',
      'mt5.status_disconnected': 'Disconnected',
      'mt5.active_account': 'Active MT5 Account',
      'mt5.switch_account': 'Switch Account',
      'mt5.add_account': 'Add MT5 Account',
      'mt5.remove_account': 'Disconnect Account',
      'mt5.accounts_list': 'Linked Accounts',
      'mt5.no_accounts': 'No MT5 Accounts Connected',
      'mt5.balance': 'Balance',
      'mt5.equity': 'Equity',

      // KPIs & Metrics
      'kpi.total_profit': 'Total Realized Profit',
      'kpi.win_rate': 'Win Rate',
      'kpi.profit_factor': 'Profit Factor',
      'kpi.max_drawdown': 'Max Drawdown',
      'kpi.best_streak': 'Longest Win Streak',
      'kpi.payoff_ratio': 'Payoff Ratio',
      'kpi.total_trades': 'Total Trades',

      // Tooltips
      'tooltip.profit_factor': 'Ratio of gross profits over gross losses. Values > 1.5 indicate solid edge.',
      'tooltip.win_rate': 'Percentage of profitable trades out of total executed trades.',
      'tooltip.max_drawdown': 'The maximum peak-to-trough decline in account balance.',
      'tooltip.payoff_ratio': 'Average winning trade profit divided by average losing trade loss.',
      'tooltip.streak': 'Maximum consecutive winning trades in the sequence.',

      // Pagination
      'pagination.showing': 'Showing',
      'pagination.of': 'of',
      'pagination.rows_per_page': 'Rows per page',
      'pagination.previous': 'Previous',
      'pagination.next': 'Next',

      // Charts & Journal
      'chart.equity_curve': 'Equity Curve',
      'chart.heatmap': 'Daily Performance Heatmap',
      'chart.trades_table': 'Trade Execution Log',
      'chart.candlestick': 'Price Action & Execution Candles',
      'chart.entry': 'ENTRY',
      'chart.sl': 'STOP LOSS',
      'chart.tp': 'TAKE PROFIT',
      'chart.rr': 'Risk:Reward Ratio',

      // Status
      'status.winner': 'WINNER',
      'status.loser': 'LOSER',
      'status.break_even': 'BREAK EVEN',
    },
    es: {
      // General Navigation & Hero
      'app.title': 'Trading Bot Analytics',
      'app.subtitle': 'Inteligencia de portafolio profesional y análisis cuantitativo de trading',
      'nav.home': 'Inicio',
      'nav.journal': 'Journal de Trading',
      'nav.upload': 'Subir Reporte',
      'nav.connect_mt5': 'Conectar MetaTrader',
      'nav.compare': 'Comparar Trades',

      // Actions & Buttons
      'actions.connect': 'Conectar Cuenta',
      'actions.sync': 'Sincronizar Deals',
      'actions.syncing': 'Sincronizando...',
      'actions.upload': 'Subir Operaciones',
      'actions.filter': 'Filtrar',
      'actions.reset': 'Reiniciar',
      'actions.close': 'Cerrar',
      'actions.cancel': 'Cancelar',
      'actions.confirm': 'Confirmar',
      'actions.delete': 'Eliminar',
      'actions.save': 'Guardar',
      'actions.show_password': 'Ver contraseña',
      'actions.hide_password': 'Ocultar contraseña',

      // MT5 Integration
      'mt5.connect_title': 'Conectar Cuenta MetaTrader 5',
      'mt5.connect_subtitle': 'Vincula tu cuenta para sincronizar operaciones y velas automáticamente',
      'mt5.account_name': 'Nombre de la Cuenta / Etiqueta',
      'mt5.server': 'Servidor del Broker',
      'mt5.login': 'ID de Login / Cuenta',
      'mt5.password': 'Contraseña de Inversor (Lectura)',
      'mt5.broker': 'Nombre del Broker',
      'mt5.status_connected': 'Conectado',
      'mt5.status_syncing': 'Sincronizando...',
      'mt5.status_disconnected': 'Desconectado',
      'mt5.active_account': 'Cuenta MT5 Activa',
      'mt5.switch_account': 'Cambiar de Cuenta',
      'mt5.add_account': 'Agregar Cuenta MT5',
      'mt5.remove_account': 'Desconectar Cuenta',
      'mt5.accounts_list': 'Cuentas Vinculadas',
      'mt5.no_accounts': 'No hay cuentas MT5 conectadas',
      'mt5.balance': 'Balance',
      'mt5.equity': 'Equity',

      // KPIs & Metrics
      'kpi.total_profit': 'Ganancia Total Realizada',
      'kpi.win_rate': 'Tasa de Acierto (Win Rate)',
      'kpi.profit_factor': 'Profit Factor',
      'kpi.max_drawdown': 'Drawdown Máximo',
      'kpi.best_streak': 'Mayor Racha Ganadora',
      'kpi.payoff_ratio': 'Payoff Ratio',
      'kpi.total_trades': 'Total de Operaciones',

      // Tooltips
      'tooltip.profit_factor': 'Ratio de ganancias brutas sobre pérdidas brutas. Valores > 1.5 indican ventaja sólida.',
      'tooltip.win_rate': 'Porcentaje de operaciones ganadoras sobre el total ejecutado.',
      'tooltip.max_drawdown': 'La mayor caída porcentual/monetaria desde el punto más alto del balance.',
      'tooltip.payoff_ratio': 'Ganancia promedio de trades ganadores dividida por la pérdida promedio.',
      'tooltip.streak': 'Máximo número consecutivo de operaciones ganadoras.',

      // Pagination
      'pagination.showing': 'Mostrando',
      'pagination.of': 'de',
      'pagination.rows_per_page': 'Filas por página',
      'pagination.previous': 'Anterior',
      'pagination.next': 'Siguiente',

      // Charts & Journal
      'chart.equity_curve': 'Curva de Capital (Equity Curve)',
      'chart.heatmap': 'Heatmap de Rendimiento Diario',
      'chart.trades_table': 'Registro de Operaciones',
      'chart.candlestick': 'Acción del Precio y Velas de Ejecución',
      'chart.entry': 'ENTRADA',
      'chart.sl': 'STOP LOSS',
      'chart.tp': 'TAKE PROFIT',
      'chart.rr': 'Ratio Riesgo:Beneficio',

      // Status
      'status.winner': 'GANADOR',
      'status.loser': 'PERDEDOR',
      'status.break_even': 'BREAK EVEN',
    }
  }

  const setLocale = (locale: Locale) => {
    currentLocale.value = locale
  }

  const t = (key: string): string => {
    return translations[currentLocale.value]?.[key] || translations['en']?.[key] || key
  }

  return {
    currentLocale,
    setLocale,
    t
  }
})
