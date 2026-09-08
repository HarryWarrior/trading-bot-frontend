import { ref, watch, onMounted } from 'vue'

export type Theme = 'dark' | 'light'

const currentTheme = ref<Theme>('dark')

export function useTheme() {
  const isDark = ref(currentTheme.value === 'dark')

  const applyTheme = (theme: Theme) => {
    currentTheme.value = theme
    isDark.value = theme === 'dark'

    if (typeof window !== 'undefined') {
      const root = document.documentElement
      if (theme === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
        root.style.colorScheme = 'dark'
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
        root.style.colorScheme = 'light'
      }
      try {
        localStorage.setItem('trading_bot_theme', theme)
      } catch (e) {
        // LocalStorage might be restricted
      }
    }
  }

  const toggleTheme = () => {
    const nextTheme: Theme = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
  }

  const initTheme = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('trading_bot_theme') as Theme | null
        if (saved === 'light' || saved === 'dark') {
          applyTheme(saved)
          return
        }
      } catch (e) {}

      // Default to dark theme for financial workstation
      applyTheme('dark')
    }
  }

  return {
    theme: currentTheme,
    isDark,
    toggleTheme,
    applyTheme,
    initTheme
  }
}
