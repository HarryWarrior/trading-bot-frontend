import { describe, expect, it } from 'vitest'
import { resolveMt5View, formatStatusMoney, formatStatusTime, tradeModeLabelKey } from '~/features/mt5-connection/composables/mt5View'

describe('resolveMt5View', () => {
  it('admin gets the manage view', () => expect(resolveMt5View('admin')).toBe('manage'))
  it('non-admin and unknown get the explanation', () => {
    expect(resolveMt5View('user')).toBe('readonly')
    expect(resolveMt5View(null)).toBe('readonly')
    expect(resolveMt5View(undefined)).toBe('readonly')
  })
})

describe('status formatting', () => {
  it('money shows — when null or disconnected', () => {
    expect(formatStatusMoney(null, true)).toBe('—')
    expect(formatStatusMoney(1234.5, false)).toBe('—')
    expect(formatStatusMoney(1234.5, true)).toBe('1234.50')
  })
  it('time shows — when null', () => {
    expect(formatStatusTime(null)).toBe('—')
    expect(formatStatusTime('2026-01-01T10:00:00Z')).not.toBe('—')
    expect(formatStatusTime('2026-01-01T10:00:00Z')).toContain('2026')
  })
  it('trade mode label key', () => {
    expect(tradeModeLabelKey('demo')).toBe('mt5c.mode.demo')
    expect(tradeModeLabelKey('real')).toBe('mt5c.mode.real')
    expect(tradeModeLabelKey('contest')).toBe('mt5c.mode.other')
  })
})
