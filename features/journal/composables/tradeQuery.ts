import type { TradeQuery } from '../types'

const present = (value: unknown): boolean =>
  value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')

const trimmed = (value: unknown): unknown => (typeof value === 'string' ? value.trim() : value)

/** Filters/pagination/sort to backend query params (snake_case); empty values are omitted. */
export const buildTradesQuery = (query: TradeQuery = {}): Record<string, string | number> => {
  const pairs: Array<[string, unknown]> = [
    ['page', query.page ?? 1],
    ['page_size', query.pageSize ?? 20],
    ['sort_by', query.sortBy],
    ['sort_dir', query.sortDir],
    ['q', trimmed(query.q)],
    ['symbol', trimmed(query.symbol)],
    ['outcome', query.outcome],
    ['date_from', query.dateFrom],
    ['date_to', query.dateTo],
    ['profit_min', query.profitMin],
    ['profit_max', query.profitMax],
    ['account_ref', query.accountRef],
  ]
  const out: Record<string, string | number> = {}
  for (const [key, value] of pairs) {
    if (present(value)) out[key] = trimmed(value) as string | number
  }
  return out
}
