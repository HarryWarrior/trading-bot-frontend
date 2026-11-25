import { describe, expect, it } from 'vitest'
import { isPublicRoute, resolveAuthRedirect } from '~/features/auth/composables/routeGuard'

describe('resolveAuthRedirect', () => {
  it.each(['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'])(
    'lets signed-out users reach %s',
    (path) => {
      expect(isPublicRoute(path)).toBe(true)
      expect(resolveAuthRedirect(path, false)).toBeNull()
    },
  )

  it.each(['/', '/journal', '/trades', '/upload', '/mt5', '/journal/abc'])(
    'sends signed-out users from %s to /login',
    (path) => {
      expect(resolveAuthRedirect(path, false)).toBe('/login')
    },
  )

  it('lets signed-in users reach protected pages', () => {
    expect(resolveAuthRedirect('/journal', true)).toBeNull()
  })

  it('sends signed-in users away from login and register to /journal', () => {
    expect(resolveAuthRedirect('/login', true)).toBe('/journal')
    expect(resolveAuthRedirect('/register', true)).toBe('/journal')
  })

  it('keeps signed-in users able to open verification and reset pages', () => {
    expect(resolveAuthRedirect('/verify-email', true)).toBeNull()
    expect(resolveAuthRedirect('/reset-password', true)).toBeNull()
  })

  it('ignores trailing slashes', () => {
    expect(resolveAuthRedirect('/login/', false)).toBeNull()
  })
})
