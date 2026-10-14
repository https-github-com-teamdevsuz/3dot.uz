export type Theme = 'dark' | 'light'

// DOM attribute is the source of truth; state stays 'dark' through SSR + hydration
// and is synced by plugins/theme.client.ts on app:mounted. Never v-if on it.
export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'dark')
  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme.value
    try { localStorage.setItem('3dot:theme', theme.value) } catch { /* private mode */ }
  }
  return { theme, toggle }
}
