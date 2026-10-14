export default defineNuxtPlugin((nuxtApp) => {
  const { theme } = useTheme()
  const read = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  nuxtApp.hook('app:mounted', () => { theme.value = read() })

  const mq = matchMedia('(prefers-color-scheme: light)')
  mq.addEventListener('change', (e) => {
    let stored: string | null = null
    try { stored = localStorage.getItem('3dot:theme') } catch { /* ignore */ }
    if (stored) return
    theme.value = e.matches ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme.value
  })
})
