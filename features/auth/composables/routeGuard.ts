const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password']
/** Signed-in users have no reason to see these. */
const GUEST_ONLY_ROUTES = ['/login', '/register']

export const HOME_ROUTE = '/journal'
export const LOGIN_ROUTE = '/login'

const normalize = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, '') : path)

export const isPublicRoute = (path: string): boolean => PUBLIC_ROUTES.includes(normalize(path))

/** Pure redirect decision for the global middleware: a target path, or null to continue. */
export const resolveAuthRedirect = (path: string, signedIn: boolean): string | null => {
  const clean = normalize(path)
  if (!signedIn) return isPublicRoute(clean) ? null : LOGIN_ROUTE
  return GUEST_ONLY_ROUTES.includes(clean) ? HOME_ROUTE : null
}
