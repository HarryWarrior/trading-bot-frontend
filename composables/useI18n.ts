import { useI18nStore, type Locale } from '~/stores/i18n'
import { computed } from 'vue'

export const useI18n = () => {
  const store = useI18nStore()

  const locale = computed(() => store.currentLocale)

  const t = (key: string): string => {
    return store.t(key)
  }

  const setLocale = (newLocale: Locale) => {
    store.setLocale(newLocale)
  }

  return {
    locale,
    t,
    setLocale
  }
}
