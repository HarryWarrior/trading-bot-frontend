import { useApiClient } from '~/composables/useApiClient'
import { buildTradesQuery } from '../composables/tradeQuery'
import type { ImportResult, JournalAccount, JournalPagination, Trade, TradeOutcome, TradeQuery, TradesPage } from '../types'

/** Backend DTOs (snake_case). Mapping to view types happens only in this file. */
interface TradeDto {
  id: string
  account_ref: string
  position_id: string | null
  symbol: string
  side: string
  volume: number
  open_time: string
  close_time: string
  open_price: number
  close_price: number
  stop_loss: number | null
  take_profit: number | null
  commission: number
  swap: number
  profit: number
  net: number
  outcome: TradeOutcome
  duration_minutes: number | null
  comment: string | null
  source: string
  import_id: string | null
}

interface ImportDto {
  id: string
  filename: string
  account_ref: string
  trades_created: number
  trades_updated: number
  balance_events: number
  skipped_rows: Array<{ row: number; reason: string }>
  created_at: string
}

interface PaginationDto {
  page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

interface AccountDto {
  account_ref: string
  trades: number
  first_trade_at: string | null
  last_trade_at: string | null
}

export const toTrade = (dto: TradeDto): Trade => ({
  id: dto.id,
  accountRef: dto.account_ref,
  positionId: dto.position_id,
  symbol: dto.symbol,
  side: dto.side,
  volume: dto.volume,
  openTime: dto.open_time,
  closeTime: dto.close_time,
  openPrice: dto.open_price,
  closePrice: dto.close_price,
  stopLoss: dto.stop_loss ?? null,
  takeProfit: dto.take_profit ?? null,
  commission: dto.commission,
  swap: dto.swap,
  profit: dto.profit,
  net: dto.net,
  outcome: dto.outcome,
  durationMinutes: dto.duration_minutes ?? null,
  comment: dto.comment ?? null,
  source: dto.source,
  importId: dto.import_id ?? null,
})

export const toImport = (dto: ImportDto): ImportResult => ({
  id: dto.id,
  filename: dto.filename,
  accountRef: dto.account_ref,
  tradesCreated: dto.trades_created,
  tradesUpdated: dto.trades_updated,
  balanceEvents: dto.balance_events,
  skippedRows: (dto.skipped_rows ?? []).map((r) => ({ row: r.row, reason: r.reason })),
  createdAt: dto.created_at,
})

export const toPagination = (dto: PaginationDto): JournalPagination => ({
  page: dto.page,
  pageSize: dto.page_size,
  totalItems: dto.total_items,
  totalPages: dto.total_pages,
  hasNext: dto.has_next,
  hasPrev: dto.has_prev,
})

export const toAccount = (dto: AccountDto): JournalAccount => ({
  accountRef: dto.account_ref,
  trades: dto.trades,
  firstTradeAt: dto.first_trade_at ?? null,
  lastTradeAt: dto.last_trade_at ?? null,
})

export const journalApi = {
  async uploadReport(file: File): Promise<ImportResult> {
    const form = new FormData()
    form.append('file', file)
    const data = await useApiClient().post<{ import: ImportDto }>('/journal/imports', form)
    return toImport(data.import)
  },

  async listTrades(query: TradeQuery = {}): Promise<TradesPage> {
    const data = await useApiClient().get<{ items: TradeDto[]; pagination: PaginationDto }>(
      '/journal/trades',
      buildTradesQuery(query),
    )
    return { items: data.items.map(toTrade), pagination: toPagination(data.pagination) }
  },

  async getTrade(id: string): Promise<Trade> {
    return toTrade((await useApiClient().get<{ trade: TradeDto }>(`/journal/trades/${encodeURIComponent(id)}`)).trade)
  },

  async listAccounts(): Promise<JournalAccount[]> {
    const data = await useApiClient().get<{ items: AccountDto[] }>('/journal/accounts')
    return data.items.map(toAccount)
  },
}
