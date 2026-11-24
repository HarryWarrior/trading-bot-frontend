import { useApiClient } from '~/composables/useApiClient'
import type { AccountStatus, Mt5Account, SyncResult } from '../types'

/** Backend DTOs (snake_case). Mapping to view types happens only in this file. */
interface SyncResultDto {
  created: number
  updated: number
  balance_events: number
  open_positions: number
  skipped_positions: number
}

interface AccountDto {
  id: string
  account_ref: string
  login: number
  server: string
  name: string
  currency: string
  trade_mode: string
  company: string
  linked_at: string
  last_sync_at: string | null
  last_sync_result: SyncResultDto | null
}

interface StatusDto {
  connected: boolean
  balance: number | null
  equity: number | null
  as_of: string | null
  last_sync_at: string | null
}

export const toSyncResult = (dto: SyncResultDto): SyncResult => ({
  created: dto.created,
  updated: dto.updated,
  balanceEvents: dto.balance_events,
  openPositions: dto.open_positions,
  skippedPositions: dto.skipped_positions,
})

export const toAccount = (dto: AccountDto): Mt5Account => ({
  id: dto.id,
  accountRef: dto.account_ref,
  login: dto.login,
  server: dto.server,
  name: dto.name,
  currency: dto.currency,
  tradeMode: dto.trade_mode,
  company: dto.company,
  linkedAt: dto.linked_at,
  lastSyncAt: dto.last_sync_at ?? null,
  lastSyncResult: dto.last_sync_result ? toSyncResult(dto.last_sync_result) : null,
})

export const toStatus = (dto: StatusDto): AccountStatus => ({
  connected: dto.connected,
  balance: dto.balance ?? null,
  equity: dto.equity ?? null,
  asOf: dto.as_of ?? null,
  lastSyncAt: dto.last_sync_at ?? null,
})

const base = '/mt5/accounts'
const enc = (v: string) => encodeURIComponent(v)

export const mt5Api = {
  async link(): Promise<Mt5Account> {
    const data = await useApiClient().post<{ account: AccountDto }>(`${base}/link`)
    return toAccount(data.account)
  },
  async listAccounts(): Promise<Mt5Account[]> {
    const data = await useApiClient().get<{ accounts: AccountDto[] }>(base)
    return data.accounts.map(toAccount)
  },
  async getStatus(accountId: string): Promise<AccountStatus> {
    const data = await useApiClient().get<{ status: StatusDto }>(`${base}/${enc(accountId)}/status`)
    return toStatus(data.status)
  },
  async sync(accountId: string): Promise<SyncResult> {
    const data = await useApiClient().post<{ result: SyncResultDto }>(`${base}/${enc(accountId)}/sync`)
    return toSyncResult(data.result)
  },
  async unlink(accountId: string): Promise<void> {
    await useApiClient().delete(`${base}/${enc(accountId)}`)
  },
}
