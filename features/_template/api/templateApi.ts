import type { ApiPage, Pagination, TemplateItem } from '../types'

/** Backend DTOs (snake_case). Mapping to view types happens only in this file. */
interface ItemDto {
  id: string
  name: string
  created_at: string
}

interface PaginationDto {
  page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

const toItem = (dto: ItemDto): TemplateItem => ({ id: dto.id, name: dto.name, createdAt: dto.created_at })

const toPagination = (dto: PaginationDto): Pagination => ({
  page: dto.page,
  pageSize: dto.page_size,
  totalItems: dto.total_items,
  totalPages: dto.total_pages,
  hasNext: dto.has_next,
  hasPrev: dto.has_prev,
})

export const templateApi = {
  async listItems(params: { page?: number; pageSize?: number } = {}): Promise<ApiPage<TemplateItem>> {
    const data = await useApiClient().get<{ items: ItemDto[]; pagination: PaginationDto }>('/template/items', {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
    })
    return { items: data.items.map(toItem), pagination: toPagination(data.pagination) }
  },

  async createItem(name: string): Promise<TemplateItem> {
    return toItem(await useApiClient().post<ItemDto>('/template/items', { name }))
  },
}
