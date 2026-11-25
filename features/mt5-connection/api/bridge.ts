import { useApiClient } from '~/composables/useApiClient'
import type { BridgeAccount, BridgePage, BridgePagination, CreatedIngestToken, EaFile, IngestToken } from '../types'

/** Backend DTOs of the mt5-bridge service (snake_case). Mapping to view types happens only in this file. */
interface PaginationDto {
  page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

interface TokenDto {
  id: string
  name: string
  scope: string
  active: boolean
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

interface CreatedTokenDto {
  token: TokenDto
  plaintext_token: string
}

interface AccountDto {
  account_ref: string
  login: number
  server: string
  balance: number
  equity: number
  terminal_build: number | null
  last_heartbeat: string | null
  last_deal_at: string | null
  status: string
}

interface PageDto<T> {
  items: T[]
  pagination: PaginationDto
}

/** Same name the backend sends in Content-Disposition (`EA_DOWNLOAD_NAME`). */
export const EA_FILE_NAME = 'TradingJournalBridge.ex5'

export const toBridgePagination = (dto: PaginationDto): BridgePagination => ({
  page: dto.page,
  pageSize: dto.page_size,
  totalItems: dto.total_items,
  totalPages: dto.total_pages,
  hasNext: dto.has_next,
  hasPrev: dto.has_prev,
})

export const toIngestToken = (dto: TokenDto): IngestToken => ({
  id: dto.id,
  name: dto.name,
  scope: dto.scope,
  active: dto.active,
  createdAt: dto.created_at,
  lastUsedAt: dto.last_used_at ?? null,
  revokedAt: dto.revoked_at ?? null,
})

export const toBridgeAccount = (dto: AccountDto): BridgeAccount => ({
  accountRef: dto.account_ref,
  login: dto.login,
  server: dto.server,
  balance: dto.balance,
  equity: dto.equity,
  terminalBuild: dto.terminal_build ?? null,
  lastHeartbeat: dto.last_heartbeat ?? null,
  lastDealAt: dto.last_deal_at ?? null,
  status: dto.status === 'connected' ? 'connected' : 'disconnected',
})

const base = '/mt5-bridge'
const enc = (v: string) => encodeURIComponent(v)
type PageParams = { page?: number; pageSize?: number }
const pageQuery = (p: PageParams) => ({ page: p.page ?? 1, page_size: p.pageSize ?? 100 })

export const bridgeApi = {
  async createToken(name: string): Promise<CreatedIngestToken> {
    const data = await useApiClient().post<CreatedTokenDto>(`${base}/tokens`, { name })
    return { token: toIngestToken(data.token), plaintext: data.plaintext_token }
  },
  async listTokens(params: PageParams = {}): Promise<BridgePage<IngestToken>> {
    const data = await useApiClient().get<PageDto<TokenDto>>(`${base}/tokens`, pageQuery(params))
    return { items: data.items.map(toIngestToken), pagination: toBridgePagination(data.pagination) }
  },
  async revokeToken(id: string): Promise<IngestToken> {
    const data = await useApiClient().delete<{ token: TokenDto }>(`${base}/tokens/${enc(id)}`)
    return toIngestToken(data.token)
  },
  async listAccounts(params: PageParams = {}): Promise<BridgePage<BridgeAccount>> {
    const data = await useApiClient().get<PageDto<AccountDto>>(`${base}/accounts`, pageQuery(params))
    return { items: data.items.map(toBridgeAccount), pagination: toBridgePagination(data.pagination) }
  },
  /** Throws `ApiError('NOT_FOUND', …, 404)` while the EA has not been built. */
  async downloadEa(): Promise<EaFile> {
    const blob = await useApiClient().getBlob(`${base}/ea/download`)
    return { blob, fileName: EA_FILE_NAME }
  },
}
