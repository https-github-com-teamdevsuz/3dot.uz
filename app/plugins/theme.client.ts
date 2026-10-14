export default defineNuxtPlugin((nuxtApp) => {
  const { theme } = useTheme()
  const read = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

  const mq = matchMedia('(prefers-color-scheme: light)')
  const sync = (light: boolean) => {
    let stored: string | null = null
    try { stored = localStorage.getItem('3dot:theme') } catch { /* ignore */ }
    if (stored) return
    theme.value = light ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme.value
  }
  mq.addEventListener('change', (e) => sync(e.matches))
  // also catches scheme changes that happened before the listener existed
  nuxtApp.hook('app:mounted', () => { theme.value = read(); sync(mq.matches) })
})
