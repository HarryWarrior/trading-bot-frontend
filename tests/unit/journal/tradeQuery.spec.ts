import { describe, expect, it } from 'vitest'
import { buildTradesQuery } from '~/features/journal/composables/tradeQuery'
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
        outcome: 'WIN',
        dateFrom: '2026-01-01',
        dateTo: '2026-02-01',
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
      outcome: 'WIN',
      date_from: '2026-01-01',
      date_to: '2026-02-01',
      profit_min: 0,
      profit_max: 100,
      account_ref: 'upload',
    })
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
