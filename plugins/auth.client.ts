import { useAuthStore } from '~/features/auth/stores/auth'

/** Registers the API auth hooks. Session restore itself is awaited by the global route middleware. */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  auth.registerHooks(() => {
    void navigateTo('/login')
  })
  // Start restoring immediately so the middleware usually finds it already settled.
  void auth.restore()
})
