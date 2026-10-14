export type LeadStatus = 'idle' | 'sending' | 'sent' | 'error' | 'throttled'
export interface LeadForm { name: string; contact: string; budget: string; message: string; hp: string }

/** Posts a lead to the relay (runtimeConfig.public.leadEndpoint). Never fakes success. */
export function useLead() {
  const endpoint = useRuntimeConfig().public.leadEndpoint as string
  const locale = useLocale()
  const route = useRoute()
  const status = ref<LeadStatus>('idle')
  let lastOk = 0

  async function send(f: LeadForm) {
    if (status.value === 'sending') return
    if (f.hp) { status.value = 'sent'; return }
    if (Date.now() - lastOk < 30_000) { status.value = 'throttled'; return }
    if (!endpoint) { status.value = 'error'; return }
    status.value = 'sending'
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 10_000)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({
          name: f.name.trim(),
          contact: f.contact.trim(),
          budget: f.budget || undefined,
          message: f.message.trim() || undefined,
          locale: locale.value,
          page: route.path,
          hp: ''
        }),
        signal: ctl.signal
      })
      if (res.ok) { status.value = 'sent'; lastOk = Date.now() } else status.value = 'error'
    } catch {
      status.value = 'error'
    } finally {
      clearTimeout(timer)
    }
  }

  return { status, send, reset: () => { if (status.value !== 'sending') status.value = 'idle' } }
}
