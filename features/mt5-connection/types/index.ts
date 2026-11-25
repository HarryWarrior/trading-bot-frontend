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

/** EA bridge (mt5-bridge service). Mirrors trading_shared.envelope.Pagination in camelCase. */
export interface BridgePagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface BridgePage<T> {
  items: T[]
  pagination: BridgePagination
}

/** An ingest token as listed: never the hash nor the plaintext. */
export interface IngestToken {
  id: string
  name: string
  scope: string
  active: boolean
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
}

/** The only shape that ever carries the plaintext: returned once by token creation. */
export interface CreatedIngestToken {
  token: IngestToken
  plaintext: string
}

export type BridgeAccountStatus = 'connected' | 'disconnected'

export interface BridgeAccount {
  accountRef: string
  login: number
  server: string
  balance: number
  equity: number
  terminalBuild: number | null
  lastHeartbeat: string | null
  lastDealAt: string | null
  status: BridgeAccountStatus
}

export interface EaFile {
  blob: Blob
  fileName: string
}
