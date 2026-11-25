import { getActivePinia, type PiniaPluginContext, type Store } from 'pinia'

type ResettableStore = Store & { $resetUserState?: () => void }

/** Pinia plugin: remembers each store's initial state so it can be restored when the user changes. */
export const resetUserStatePlugin = ({ store }: PiniaPluginContext): Record<string, unknown> | void => {
  if (store.$id === 'auth') return
  const initial = JSON.stringify(store.$state)
  return { $resetUserState: () => store.$patch(JSON.parse(initial)) }
}

/** Restore every user-scoped store (all but `auth`) to its initial state. */
export const resetUserStores = (): void => {
  const pinia = getActivePinia() as unknown as { _s: Map<string, ResettableStore> } | undefined
  pinia?._s.forEach((store) => store.$resetUserState?.())
}
