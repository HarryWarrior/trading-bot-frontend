import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

/** Public face of the auth feature: session state plus actions. */
export const useAuth = () => {
  const store = useAuthStore()
  const { user, ready, loading, error, isAuthenticated, isAdmin } = storeToRefs(store)
  return {
    user,
    ready,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    signIn: store.signIn,
    signOut: store.signOut,
  }
}
