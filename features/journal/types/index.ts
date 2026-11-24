export type TradeOutcome = 'WIN' | 'LOSS' | 'BREAKEVEN'
export type TradeSortBy = 'close_time' | 'open_time' | 'profit' | 'symbol'
export type SortDir = 'asc' | 'desc'

export interface Trade {
  id: string
  accountRef: string
  positionId: string
  symbol: string
  side: string
  volume: number
  openTime: string
  closeTime: string
  openPrice: number
  closePrice: number
  stopLoss: number | null
  takeProfit: number | null
  commission: number
  swap: number
  profit: number
  net: number
  outcome: TradeOutcome
  durationMinutes: number | null
  comment: string | null
  source: string
  importId: string | null
}

export interface SkippedRow {
  row: number
  reason: string
}

export interface ImportResult {
  id: string
  filename: string
  accountRef: string
  tradesCreated: number
  tradesUpdated: number
  balanceEvents: number
  skippedRows: SkippedRow[]
  createdAt: string
}

export interface JournalPagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface JournalAccount {
  accountRef: string
  trades: number
  firstTradeAt: string | null
  lastTradeAt: string | null
}

export interface TradeFilters {
  q?: string
  symbol?: string
  outcome?: TradeOutcome | ''
  dateFrom?: string
  dateTo?: string
  profitMin?: number | null
  profitMax?: number | null
  accountRef?: string | null
}

export interface TradeQuery extends TradeFilters {
  page?: number
  pageSize?: number
  sortBy?: TradeSortBy
  sortDir?: SortDir
}

export interface TradesPage {
  items: Trade[]
  pagination: JournalPagination
}
