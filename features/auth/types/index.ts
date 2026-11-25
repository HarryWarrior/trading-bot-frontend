/** View types of the auth feature (camelCase). Backend DTOs stay private to `api/authApi.ts`. */
export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  emailVerified: boolean
  createdAt: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput extends SignInInput {
  name: string
}
