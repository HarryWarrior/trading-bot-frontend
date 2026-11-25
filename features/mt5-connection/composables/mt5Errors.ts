const ERROR_KEYS: Record<string, string> = {
  TERMINAL_NOT_AVAILABLE: 'mt5c.errors.terminal_not_available',
  TERMINAL_ACCOUNT_MISMATCH: 'mt5c.errors.terminal_account_mismatch',
  MULTIPLE_TERMINALS: 'mt5c.errors.multiple_terminals',
  SERVER_TIMEZONE_MISMATCH: 'mt5c.errors.server_timezone_mismatch',
  ACCOUNT_ALREADY_LINKED: 'mt5c.errors.account_already_linked',
  JOURNAL_UNAVAILABLE: 'mt5c.errors.journal_unavailable',
  FORBIDDEN: 'mt5c.errors.forbidden',
  NOT_FOUND: 'mt5c.errors.not_found',
  NETWORK_ERROR: 'mt5c.errors.network',
}

export const MT5_ERROR_CODES = Object.keys(ERROR_KEYS)

/** Translation key for an `ApiError.code` (never branch on messages). */
export const mt5ErrorKey = (code: string | null | undefined): string =>
  (code && ERROR_KEYS[code]) || 'mt5c.errors.generic'
