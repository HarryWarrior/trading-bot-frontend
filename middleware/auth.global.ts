import { resolveAuthRedirect } from '~/features/auth/composables/routeGuard'
import { useAuthStore } from '~/features/auth/stores/auth'

/** Sessions live in the browser (memory + localStorage), so the guard only decides on the client. */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  await auth.restore()
  const target = resolveAuthRedirect(to.path, auth.isAuthenticated)
  if (target && target !== to.path) return navigateTo(target)
})
