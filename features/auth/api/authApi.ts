import { useApiClient } from '~/composables/useApiClient'
import type { AuthSession, AuthUser, SignInInput, SignUpInput } from '../types'

/** Backend DTOs (snake_case). Mapping to view types happens only in this file. */
interface UserDto {
  id: string
  email: string
  name: string
  role: string
  email_verified: boolean
  created_at: string
}

interface SessionDto {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: UserDto
}

export const toUser = (dto: UserDto): AuthUser => ({
  id: dto.id,
  email: dto.email,
  name: dto.name,
  role: dto.role,
  emailVerified: dto.email_verified,
  createdAt: dto.created_at,
})

export const toSession = (dto: SessionDto): AuthSession => ({
  accessToken: dto.access_token,
  refreshToken: dto.refresh_token,
  tokenType: dto.token_type,
  expiresIn: dto.expires_in,
  user: toUser(dto.user),
})

export const authApi = {
  async signUp(input: SignUpInput): Promise<AuthUser> {
    const data = await useApiClient().post<{ user: UserDto }>('/auth/sign-up', { ...input })
    return toUser(data.user)
  },

  async verifyEmail(email: string, code: string): Promise<void> {
    await useApiClient().post('/auth/verify-email', { email, code })
  },

  async resendVerification(email: string): Promise<void> {
    await useApiClient().post('/auth/resend-verification', { email })
  },

  async signIn(input: SignInInput): Promise<AuthSession> {
    return toSession(await useApiClient().post<SessionDto>('/auth/sign-in', { ...input }))
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    return toSession(await useApiClient().post<SessionDto>('/auth/refresh', { refresh_token: refreshToken }, { skipAuthRefresh: true }))
  },

  async signOut(refreshToken: string): Promise<void> {
    await useApiClient().post('/auth/sign-out', { refresh_token: refreshToken })
  },

  async forgotPassword(email: string): Promise<void> {
    await useApiClient().post('/auth/forgot-password', { email })
  },

  async resetPassword(input: { token: string; newPassword: string }): Promise<void> {
    await useApiClient().post('/auth/reset-password', { token: input.token, new_password: input.newPassword })
  },

  async me(): Promise<AuthUser> {
    const data = await useApiClient().get<{ user: UserDto }>('/auth/me')
    return toUser(data.user)
  },
}
