import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { authErrorKey } from '~/features/auth/composables/authErrors'
import { isPasswordLengthValid } from '~/features/auth/composables/validation'
import { useI18nStore } from '~/stores/i18n'

describe('authErrorKey', () => {
  const codes = [
    'EMAIL_ALREADY_REGISTERED',
    'INVALID_CREDENTIALS',
    'EMAIL_NOT_VERIFIED',
    'INVALID_VERIFICATION_CODE',
    'INVALID_TOKEN',
    'VALIDATION_ERROR',
    'NETWORK_ERROR',
  ]

  it.each(codes)('maps %s to a translated message in en and es', (code) => {
    setActivePinia(createPinia())
    const i18n = useI18nStore()
    const key = authErrorKey(code)
    expect(key).not.toBe('auth.errors.generic')
    for (const locale of ['en', 'es'] as const) {
      i18n.setLocale(locale)
      expect(i18n.t(key)).not.toBe(key)
    }
  })

  it('falls back to a generic message for unknown or missing codes', () => {
    expect(authErrorKey('SOMETHING_ELSE')).toBe('auth.errors.generic')
    expect(authErrorKey(null)).toBe('auth.errors.generic')
  })
})

describe('isPasswordLengthValid', () => {
  it('requires 8 to 72 bytes', () => {
    expect(isPasswordLengthValid('1234567')).toBe(false)
    expect(isPasswordLengthValid('12345678')).toBe(true)
    expect(isPasswordLengthValid('a'.repeat(72))).toBe(true)
    expect(isPasswordLengthValid('a'.repeat(73))).toBe(false)
  })

  it('counts bytes, not characters', () => {
    expect(isPasswordLengthValid('é'.repeat(36))).toBe(true)
    expect(isPasswordLengthValid('é'.repeat(37))).toBe(false)
  })
})
