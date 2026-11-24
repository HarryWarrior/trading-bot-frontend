import { describe, expect, it } from 'vitest'
import { mt5ErrorKey, MT5_ERROR_CODES } from '~/features/mt5-connection/composables/mt5Errors'
import { mt5Messages } from '~/features/mt5-connection/composables/messages'

describe('mt5ErrorKey', () => {
  it('maps every known code to a key that exists in en and es', () => {
    expect(MT5_ERROR_CODES).toEqual(expect.arrayContaining([
      'TERMINAL_NOT_AVAILABLE', 'TERMINAL_ACCOUNT_MISMATCH', 'MULTIPLE_TERMINALS', 'SERVER_TIMEZONE_MISMATCH',
      'ACCOUNT_ALREADY_LINKED', 'JOURNAL_UNAVAILABLE', 'FORBIDDEN', 'NOT_FOUND', 'NETWORK_ERROR',
    ]))
    for (const code of MT5_ERROR_CODES) {
      const key = mt5ErrorKey(code)
      expect(mt5Messages.en[key], `${code} en`).toBeTruthy()
      expect(mt5Messages.es[key], `${code} es`).toBeTruthy()
    }
  })
  it('falls back to a generic message', () => {
    expect(mt5ErrorKey('WHATEVER')).toBe('mt5c.errors.generic')
    expect(mt5ErrorKey(null)).toBe('mt5c.errors.generic')
    expect(mt5Messages.en['mt5c.errors.generic']).toBeTruthy()
  })
  it('terminal closed message explains what to do', () => {
    expect(mt5Messages.en[mt5ErrorKey('TERMINAL_NOT_AVAILABLE')]).toContain('MetaTrader 5 is not running or not logged in')
  })
  it('en and es define the same keys', () => {
    expect(Object.keys(mt5Messages.es).sort()).toEqual(Object.keys(mt5Messages.en).sort())
  })
})
