/**
 * Shared, non-translatable site data + types. Pure TS (nuxt.config.ts imports it): no Vue/Nuxt imports.
 * Translatable copy lives in site.uz.ts / site.ru.ts / site.en.ts (all share the `SiteCopy` type).
 *
 * PLACEHOLDER values (numbers, demo cases, client names) must be replaced before going live.
 */
export const LOCALES = ['uz', 'ru', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'uz'
export const SITE_URL = 'https://3dot.uz'

export const brand = '3dot'
export const email = 'hello@3dot.uz' // TODO: real mailbox
export const phone = '+998 90 000 00 00' // TODO: real phone
export const telegram = 'https://t.me/threedot_uz'
export const socials = [
  { label: 'Telegram', href: 'https://t.me/threedot_uz' },
  { label: 'Instagram', href: 'https://instagram.com/3dot.uz' }
]

// PLACEHOLDER (owner to confirm) — the only numbers on the page (labels in locale files, same order)
export const statsBase = {
  numbers: [
    { value: 20, suffix: '+' }, // systems delivered
    { value: 5, suffix: '' } // years
  ]
}
export const priceFrom = '$1 500' // PLACEHOLDER TODO(owner): "from" price
export const integrations = ['1C', 'Payme', 'Click', 'Telegram']

// PLACEHOLDER: demo cases (fictional, nda:true = client name hidden). Translatable fields are keyed by slug in the locale files.
export const projectBase = [
  { slug: 'ijro-pro', title: 'IjroPro', year: 2026, palette: ['#c8ff5a', '#1d2b12'], stack: ['Nuxt', 'Node.js', 'PostgreSQL', 'Telegram API'], nda: true },
  { slug: 'savdo-360', title: 'Savdo360', year: 2025, palette: ['#7b5cff', '#120c2b'], stack: ['Vue', 'Laravel', '1C', 'Payme / Click'], nda: true },
  { slug: 'zavod-erp', title: 'ZavodERP', year: 2025, palette: ['#ff6b3d', '#2b0f06'], stack: ['Nuxt', 'Go', 'PostgreSQL'], nda: true },
  { slug: 'yuk-track', title: 'YukTrack', year: 2024, palette: ['#5ad1ff', '#06202b'], stack: ['Nuxt', 'Flutter', 'Node.js'], nda: true },
  { slug: 'shifo-navbat', title: 'ShifoNavbat', year: 2024, palette: ['#ffd25a', '#2b2106'], stack: ['Vue', 'Laravel', 'Telegram API'], nda: true },
  { slug: 'bozor-hub', title: 'BozorHub', year: 2023, palette: ['#ff4d6d', '#2b060d'], stack: ['Nuxt', '1C', 'Elastic'], nda: true }
] as const
export type ProjectSlug = (typeof projectBase)[number]['slug']
export const PROJECT_SLUGS: ProjectSlug[] = projectBase.map((p) => p.slug)

export interface ProjectCopy {
  summary: string
  tags: string[]
  awards: string[]
  description: string
}

/** Merged shape consumed by components. */
export interface Project extends ProjectCopy {
  slug: ProjectSlug
  title: string
  year: number
  /** two colours used to paint the procedural cover art */
  palette: [string, string]
  stack: string[]
  nda: boolean
}

export type SiteCopy = typeof import('./site.uz').default
