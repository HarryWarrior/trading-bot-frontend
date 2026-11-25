# Calling the backend

## The only path

```
feature api/ file → useApiClient() → $fetch → gateway /api/v1/<service>/...
```

`composables/useApiClient.ts`:
- Base URL `${NUXT_PUBLIC_API_BASE_URL}/api/${NUXT_PUBLIC_API_VERSION}`.
- Adds `Authorization: Bearer <token>` when logged in *(token source wired in spec 001)*.
- Unwraps the success envelope and returns `data`.
- Throws `ApiError(code, message, status, details)` for error envelopes; `HTTP_<status>` for non-envelope
  errors; `NETWORK_ERROR` only when the server is unreachable (status 0).

## Backend contract (from `Trading-bot-backend/.agents/rules/api-contracts.md`)

```json
{ "success": true, "data": { "items": [], "pagination": { "page": 1, "page_size": 20, "total_items": 0, "total_pages": 0, "has_next": false, "has_prev": false } }, "message": "...", "meta": { "timestamp": "...", "version": "..." } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

## Writing an api module

```ts
export const journalApi = {
  async listTrades(params: { page?: number; pageSize?: number; q?: string } = {}): Promise<ApiPage<Trade>> {
    const data = await useApiClient().get<{ items: TradeDto[]; pagination: PaginationDto }>('/journal/trades', {
      page: params.page ?? 1, page_size: params.pageSize ?? 20, q: params.q,
    })
    return { items: data.items.map(toTrade), pagination: toPagination(data.pagination) }
  },
}
```

## Rules

- DTO types (snake_case) are private to the api file; everything else sees camelCase view types.
- Handle errors by `ApiError.code` (`UNAUTHENTICATED` → login, `VALIDATION_ERROR` → field errors).
  Never parse messages.
- Pagination params always `page`, `page_size`, `sort_by`, `sort_dir`, `q`.
- No retries or caching in api files unless a spec asks for it.
- Binary downloads use `useApiClient().getBlob(path)` (auth header, refresh-on-401, JSON error envelope read
  back from the blob into `ApiError`); saving the file to disk happens in the feature's composable.
- Legacy stores (`stores/analytics.ts`, `stores/mt5.ts`) still call `$fetch` directly; migrated in spec 001.
