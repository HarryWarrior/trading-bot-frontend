export type Mt5View = 'manage' | 'readonly'

/** Admin manages the terminal link; everyone else only sees an explanation. */
export const resolveMt5View = (role: string | null | undefined): Mt5View => (role === 'admin' ? 'manage' : 'readonly')

/** Unsigned 2 dp balance/equity; "—" when unknown or the terminal is not connected. */
export const formatStatusMoney = (value: number | null | undefined, connected: boolean): string =>
  !connected || value === null || value === undefined || Number.isNaN(value) ? '—' : value.toFixed(2)

export const formatStatusTime = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

export const tradeModeLabelKey = (mode: string): string =>
  mode === 'demo' ? 'mt5c.mode.demo' : mode === 'real' ? 'mt5c.mode.real' : 'mt5c.mode.other'
