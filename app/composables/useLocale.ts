import { DEFAULT_LOCALE, LOCALES, SITE_URL, projectBase, statsBase } from '~/data/site'
import type { Locale, Project, SiteCopy } from '~/data/site'
import uz from '~/data/site.uz'

type Site = Omit<SiteCopy, 'projects' | 'stats'> & {
  projects: Project[]
  stats: {
    headline: string
    caption: string
    total: number
    awards: { name: string; count: number }[]
    numbers: { value: number; suffix: string; label: string }[]
  }
}

const PREFIX_RE = /^\/(ru|en)(?=\/|$)/

export const localeFromPath = (path: string): Locale => (PREFIX_RE.exec(path)?.[1] as Locale | undefined) ?? DEFAULT_LOCALE
const stripLocale = (path: string) => path.replace(PREFIX_RE, '') || '/'
const prefixed = (l: Locale, path: string) => (l === DEFAULT_LOCALE ? path : `/${l}${path === '/' ? '' : path}`)

// Immutable merged copy per locale. Module-level is safe across prerender requests:
// the active locale is always read from the route, never from this state.
const cache = shallowReactive<Partial<Record<Locale, Site>>>({})

const build = (c: SiteCopy): Site => ({
  ...c,
  projects: projectBase.map((b) => ({
    ...b,
    palette: [...b.palette] as [string, string],
    stack: [...b.stack],
    ...c.projects[b.slug]
  })),
  stats: {
    headline: c.stats.headline,
    caption: c.stats.caption,
    total: statsBase.total,
    awards: c.stats.awards.map((name, i) => ({ name, count: statsBase.awards[i] ?? 0 })),
    numbers: statsBase.numbers.map((n, i) => ({ ...n, label: c.stats.numbers[i] ?? '' }))
  }
})
cache.uz = build(uz)

export async function loadLocale(l: Locale): Promise<void> {
  if (cache[l]) return
  const mod = l === 'ru' ? await import('~/data/site.ru') : await import('~/data/site.en')
  cache[l] = build(mod.default)
}

export function storeLocale(l: Locale) {
  try { localStorage.setItem('3dot:locale', l) } catch { /* private mode */ }
}

export const useLocale = () => {
  const route = useRoute()
  return computed(() => localeFromPath(route.path))
}

export const useSite = () => {
  const locale = useLocale()
  return computed(() => {
    const s = cache[locale.value]
    if (!s && import.meta.dev) console.warn(`[i18n] "${locale.value}" copy not loaded, falling back to uz`)
    return s ?? cache.uz!
  })
}

export const useLocalePath = () => {
  const locale = useLocale()
  return (path: string) => prefixed(locale.value, path)
}

export const useSwitchLocalePath = () => {
  const route = useRoute()
  return (l: Locale) => prefixed(l, stripLocale(route.path)) + route.hash
}

export const useLocaleHead = () => {
  const route = useRoute()
  const locale = useLocale()
  const t = useSite()
  const base = computed(() => stripLocale(route.path))
  const url = (l: Locale) => (SITE_URL + prefixed(l, base.value)).replace(/(.)\/$/, '$1')
  useHead(() => ({
    htmlAttrs: { lang: locale.value },
    link: [
      { rel: 'canonical', href: url(locale.value) },
      ...LOCALES.map((l) => ({ rel: 'alternate' as const, hreflang: l, href: url(l) })),
      { rel: 'alternate', hreflang: 'x-default', href: url(DEFAULT_LOCALE) }
    ],
    meta: [{ property: 'og:locale', content: t.value.meta.ogLocale }]
  }))
}
