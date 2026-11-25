import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi, toSession, toUser } from '~/features/auth/api/authApi'

const fetchMock = vi.fn()
const ok = (data: unknown) => ({ success: true, data, message: 'ok', meta: { timestamp: 't', version: 'v1' } })

const userDto = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Ann',
  role: 'admin',
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z',
}
const sessionDto = {
  access_token: 'acc',
  refresh_token: 'ref',
  token_type: 'bearer',
  expires_in: 900,
  user: userDto,
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '', apiVersion: 'v1' } }))
})

describe('auth mappers', () => {
  it('maps a user DTO to camelCase', () => {
    expect(toUser(userDto)).toEqual({
      id: 'u1',
      email: 'a@b.com',
      name: 'Ann',
      role: 'admin',
      emailVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
    })
  })

  it('maps a session DTO', () => {
    expect(toSession(sessionDto)).toEqual({
      accessToken: 'acc',
      refreshToken: 'ref',
      tokenType: 'bearer',
      expiresIn: 900,
      user: toUser(userDto),
    })
  })
})

describe('authApi', () => {
  it('signIn posts credentials and maps the session', async () => {
    fetchMock.mockResolvedValue(ok(sessionDto))
    const session = await authApi.signIn({ email: 'a@b.com', password: 'secret123' })
    expect(session.accessToken).toBe('acc')
    const [path, options] = fetchMock.mock.calls[0]
    expect(path).toBe('/auth/sign-in')
    expect(options.method).toBe('POST')
    expect(options.body).toEqual({ email: 'a@b.com', password: 'secret123' })
  })

  it('signUp returns the created user', async () => {
    fetchMock.mockResolvedValue(ok({ user: userDto }))
    const user = await authApi.signUp({ email: 'a@b.com', password: 'secret123', name: 'Ann' })
    expect(user.emailVerified).toBe(true)
    expect(fetchMock.mock.calls[0][0]).toBe('/auth/sign-up')
  })

  it('resetPassword sends snake_case body', async () => {
    fetchMock.mockResolvedValue(ok({}))
    await authApi.resetPassword({ token: 't', newPassword: 'newsecret1' })
    expect(fetchMock.mock.calls[0][1].body).toEqual({ token: 't', new_password: 'newsecret1' })
  })

  it('refresh sends the refresh token', async () => {
    fetchMock.mockResolvedValue(ok(sessionDto))
    await authApi.refresh('ref')
    expect(fetchMock.mock.calls[0][1].body).toEqual({ refresh_token: 'ref' })
  })

  it('me unwraps the user', async () => {
    fetchMock.mockResolvedValue(ok({ user: userDto }))
    expect((await authApi.me()).email).toBe('a@b.com')
  })
})
