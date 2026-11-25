import type { TradeQuery } from '../types'

const present = (value: unknown): boolean =>
  value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')

const trimmed = (value: unknown): unknown => (typeof value === 'string' ? value.trim() : value)

/** The backend `date_to` is exclusive: the picked calendar day becomes the next day (UTC date arithmetic). */
export const exclusiveDateTo = (day: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (!m) return day
  const next = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 1))
  return next.toISOString().slice(0, 10)
}

export const isInvalidDateRange = (from?: string, to?: string): boolean => !!from && !!to && from > to

/** Filters/pagination/sort to backend query params (snake_case); empty values are omitted. */
export const buildTradesQuery = (query: TradeQuery = {}): Record<string, string | number> => {
  const pairs: Array<[string, unknown]> = [
    ['page', query.page ?? 1],
    ['page_size', query.pageSize ?? 20],
    ['sort_by', query.sortBy],
    ['sort_dir', query.sortDir],
    ['q', trimmed(query.q)],
    ['symbol', typeof query.symbol === 'string' ? query.symbol.trim().toUpperCase() : query.symbol],
    ['outcome', query.outcome],
    ['date_from', query.dateFrom],
    ['date_to', present(query.dateTo) ? exclusiveDateTo(query.dateTo as string) : undefined],
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
