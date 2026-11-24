const ERROR_KEYS: Record<string, string> = {
  EMAIL_ALREADY_REGISTERED: 'auth.errors.email_already_registered',
  INVALID_CREDENTIALS: 'auth.errors.invalid_credentials',
  EMAIL_NOT_VERIFIED: 'auth.errors.email_not_verified',
  INVALID_VERIFICATION_CODE: 'auth.errors.invalid_verification_code',
  INVALID_TOKEN: 'auth.errors.invalid_token',
  VALIDATION_ERROR: 'auth.errors.validation',
  NETWORK_ERROR: 'auth.errors.network',
}

/** Translation key for an `ApiError.code` (never branch on messages). */
export const authErrorKey = (code: string | null | undefined): string =>
  (code && ERROR_KEYS[code]) || 'auth.errors.generic'
