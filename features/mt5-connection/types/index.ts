/** View types of the mt5-connection feature (camelCase). DTOs stay private to `api/mt5Api.ts`. */
export interface SyncResult {
  created: number
  updated: number
  balanceEvents: number
  openPositions: number
  skippedPositions: number
}

export interface Mt5Account {
  id: string
  accountRef: string
  login: number
  server: string
  name: string
  currency: string
  tradeMode: string
  company: string
  linkedAt: string
  lastSyncAt: string | null
  lastSyncResult: SyncResult | null
}

export interface AccountStatus {
  connected: boolean
  balance: number | null
  equity: number | null
  asOf: string | null
  lastSyncAt: string | null
}
