# State: stores and composables

## Stores

- Pinia **setup stores** (`defineStore('id', () => { ... })`), one per feature concern, in
  `features/<f>/stores/`.
- State: data refs + `loading` + `error`. Actions are `async`, set `loading`/`error`, call the
  feature's `api/` module.
- A store never mutates another feature's store. Cross-feature needs go through that feature's
  public composable.
- Global app state (theme, i18n, auth session) lives in root `stores/` and is the only exception.

```ts
export const useJournalTradesStore = defineStore('journalTrades', () => {
  const trades = ref<Trade[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async (page = 1) => {
    loading.value = true
    error.value = null
    try {
      trades.value = (await journalApi.listTrades({ page })).items
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Unexpected error'
    } finally {
      loading.value = false
    }
  }

  return { trades, loading, error, load }
})
```

## Composables

- `use<Feature>()` is the public face of the feature: returns `storeToRefs` state + actions.
- Pure helpers (formatting, calculations) go in `features/<f>/composables/` or `utils/` if shared,
  and must be side-effect free.
- No `$fetch` in composables.
