/** Public surface of the feature. Other features and pages import only from here. */
export { templateApi } from './api/templateApi'
export { useTemplateItems } from './composables/useTemplateItems'
export { useTemplateItemsStore } from './stores/templateItems'
export type { ApiPage, Pagination, TemplateItem } from './types'
