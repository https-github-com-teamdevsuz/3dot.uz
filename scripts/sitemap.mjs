// postgenerate: builds .output/public/sitemap.xml from the prerendered HTML (the ground truth),
// with xhtml:link hreflang alternates. Routes are slash-less: ru.html -> /ru, ru/projects/x.html -> /ru/projects/x.
import { readdirSync, writeFileSync } from 'node:fs'
import { join, sep } from 'node:path'

const SITE = 'https://3dot.uz'
const LOCALES = ['uz', 'ru', 'en'] // uz = default, unprefixed
const DIR = '.output/public'

const pages = readdirSync(DIR, { recursive: true })
  .map((f) => f.split(sep).join('/'))
  .filter((f) => f.endsWith('.html') && !/^(200|404)\.html$/.test(f))
  .map((f) => '/' + f.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''))

const base = (p) => p.replace(/^\/(ru|en)(?=\/|$)/, '') || '/'
const url = (l, b) => SITE + (l === 'uz' ? (b === '/' ? '' : b) : `/${l}${b === '/' ? '' : b}`)

const entries = [...new Set(pages.map(base))].sort().flatMap((b) => {
  const alts = LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, b)}"/>`)
  alts.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${url('uz', b)}"/>`)
  return LOCALES.filter((l) => pages.includes(url(l, b).slice(SITE.length) || '/')).map(
    (l) => `  <url>\n    <loc>${url(l, b)}</loc>\n${alts.join('\n')}\n  </url>`
  )
})

writeFileSync(
  join(DIR, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
)
console.log(`sitemap.xml: ${entries.length} urls`)
