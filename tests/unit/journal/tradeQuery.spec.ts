import { describe, expect, it } from 'vitest'
import { buildTradesQuery, isInvalidDateRange } from '~/features/journal/composables/tradeQuery'
import { formatMoney, pnlClass } from '~/features/journal/composables/format'

describe('buildTradesQuery', () => {
  it('defaults to page 1, size 20 and omits empty filters', () => {
    expect(buildTradesQuery({ q: '  ', symbol: '', outcome: '', accountRef: null })).toEqual({ page: 1, page_size: 20 })
  })

  it('maps filters, pagination and sort to snake_case params', () => {
    expect(
      buildTradesQuery({
        page: 3,
        pageSize: 50,
        sortBy: 'profit',
        sortDir: 'asc',
        symbol: ' EURUSD ',
        outcome: 'win',
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
        profitMin: 0,
        profitMax: 100,
        accountRef: 'upload',
      }),
    ).toEqual({
      page: 3,
      page_size: 50,
      sort_by: 'profit',
      sort_dir: 'asc',
      symbol: 'EURUSD',
      outcome: 'win',
      date_from: '2026-01-01',
      date_to: '2026-02-01',
      profit_min: 0,
      profit_max: 100,
      account_ref: 'upload',
    })
  })
})

describe('date_to is exclusive on the backend', () => {
  const to = (d: string) => buildTradesQuery({ dateTo: d }).date_to
  it('sends the day after the picked day', () => {
    expect(to('2026-01-31')).toBe('2026-02-01')
    expect(to('2026-12-31')).toBe('2027-01-01')
    expect(to('2024-02-28')).toBe('2024-02-29')
    expect(to('2024-02-29')).toBe('2024-03-01')
    expect(to('2026-02-28')).toBe('2026-03-01')
  })
  it('keeps date_from inclusive', () => {
    expect(buildTradesQuery({ dateFrom: '2026-01-01' }).date_from).toBe('2026-01-01')
  })
  it('detects from > to', () => {
    expect(isInvalidDateRange('2026-02-01', '2026-01-31')).toBe(true)
    expect(isInvalidDateRange('2026-01-31', '2026-01-31')).toBe(false)
    expect(isInvalidDateRange('', '2026-01-31')).toBe(false)
  })
})

describe('symbol', () => {
  it('is trimmed and upper-cased', () => {
    expect(buildTradesQuery({ symbol: ' eurusd ' }).symbol).toBe('EURUSD')
  })
})

describe('money formatting', () => {
  it('signs and rounds to 2 dp', () => {
    expect(formatMoney(12.3)).toBe('+12.30')
    expect(formatMoney(-5)).toBe('−5.00')
    expect(formatMoney(0)).toBe('0.00')
    expect(formatMoney(null)).toBe('—')
  })

  it('colors by sign', () => {
    expect(pnlClass(1)).toContain('emerald')
    expect(pnlClass(-1)).toContain('rose')
    expect(pnlClass(0)).toContain('zinc')
    expect(pnlClass(null)).toContain('zinc')
  })
})
