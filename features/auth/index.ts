/** Public surface of the feature. Other features and pages import only from here. */
export { authApi } from './api/authApi'
export { useAuth } from './composables/useAuth'
export { authErrorKey } from './composables/authErrors'
export { resolveAuthRedirect, isPublicRoute } from './composables/routeGuard'
export { isPasswordLengthValid, isEmailLike } from './composables/validation'
export { useAuthStore } from './stores/auth'
export type { AuthSession, AuthUser } from './types'
