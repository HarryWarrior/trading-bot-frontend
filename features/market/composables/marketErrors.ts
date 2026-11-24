const KEYS: Record<string, string> = {
  TERMINAL_NOT_AVAILABLE: 'market.errors.terminal',
  SYMBOL_NOT_FOUND: 'market.errors.symbol',
  SERVER_TIMEZONE_MISMATCH: 'market.errors.timezone',
  OUT_OF_RANGE: 'market.errors.out_of_range',
}

/** Translation key explaining why candles are unavailable. */
export const marketErrorKey = (code: string): string => KEYS[code] ?? 'market.errors.generic'
