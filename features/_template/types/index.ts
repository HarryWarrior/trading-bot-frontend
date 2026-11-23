/** Mirrors the backend pagination contract (trading_shared.envelope.Pagination), in camelCase. */
export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiPage<T> {
  items: T[]
  pagination: Pagination
}

export interface TemplateItem {
  id: string
  name: string
  createdAt: string
}
