import { storeToRefs } from 'pinia'
import { useTemplateItemsStore } from '../stores/templateItems'

/** Public entry point for pages: reactive state + actions of the template feature. */
export const useTemplateItems = () => {
  const store = useTemplateItemsStore()
  const { items, pagination, loading, error } = storeToRefs(store)
  return { items, pagination, loading, error, load: store.load, add: store.add }
}
