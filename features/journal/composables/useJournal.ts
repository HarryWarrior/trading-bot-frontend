import { storeToRefs } from 'pinia'
import { useJournalAccountsStore } from '../stores/journalAccounts'
import { useJournalImportStore } from '../stores/journalImport'
import { useJournalTradesStore } from '../stores/journalTrades'

/** Public faces of the journal feature: state as refs plus actions. */
export const useJournalTrades = () => {
  const store = useJournalTradesStore()
  return {
    ...storeToRefs(store),
    load: store.load,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
    setPage: store.setPage,
    setPageSize: store.setPageSize,
    setSort: store.setSort,
  }
}

export const useJournalImport = () => {
  const store = useJournalImportStore()
  return { ...storeToRefs(store), upload: store.upload, reset: store.reset }
}

export const useJournalAccounts = () => {
  const store = useJournalAccountsStore()
  return { ...storeToRefs(store), load: store.load }
}
