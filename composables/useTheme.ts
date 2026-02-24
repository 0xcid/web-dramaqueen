const THEME_KEY = 'dramaqueen_theme'

const theme = ref<'light' | 'dark'>('dark')

export const useTheme = () => {
  const isDark = computed(() => theme.value === 'dark')
  
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    if (import.meta.client) {
      localStorage.setItem(THEME_KEY, newTheme)
      updateDocument()
    }
  }
  
  const toggleTheme = () => {
    setTheme(isDark.value ? 'light' : 'dark')
  }
  
  const updateDocument = () => {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', isDark.value)
      document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
    }
  }
  
  const loadTheme = () => {
    if (import.meta.client) {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored === 'light' || stored === 'dark') {
        theme.value = stored
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        theme.value = prefersDark ? 'dark' : 'light'
      }
      updateDocument()
    }
  }
  
  if (import.meta.client) {
    loadTheme()
  }
  
  return {
    theme: readonly(theme),
    isDark: readonly(isDark),
    setTheme,
    toggleTheme
  }
}
