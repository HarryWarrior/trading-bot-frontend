import { storeToRefs } from 'pinia'
import { useMt5BridgeStore } from '../stores/mt5Bridge'
import { saveFile } from './bridgeView'

/** Public face of the EA bridge part of the feature (tokens, accounts, EA download). */
export const useMt5Bridge = () => {
  const store = useMt5BridgeStore()
  const refs = storeToRefs(store)

  /** Downloads and saves the EA; an unavailable EA only flips `eaUnavailable`. */
  const downloadEa = async (): Promise<void> => {
    const file = await store.downloadEa()
    if (file) saveFile(file.blob, file.fileName)
  }

  return {
    ...refs,
    loadTokens: store.loadTokens,
    createToken: store.createToken,
    dismissCreatedToken: store.dismissCreatedToken,
    revokeToken: store.revokeToken,
    loadAccounts: store.loadAccounts,
    downloadEa,
  }
}
