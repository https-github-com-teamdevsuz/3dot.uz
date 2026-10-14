import { DEFAULT_LOCALE, LOCALES, SITE_URL, brand, email, socials } from '~/data/site'
import type { Locale } from '~/data/site'
import uz from '~/data/seo.uz'
import ru from '~/data/seo.ru'
import en from '~/data/seo.en'

/** Fill once after verifying the domain; tags are emitted only when non-empty. */
export const SITE_VERIFICATION = {
  google: '', // Google Search Console → HTML tag → content="…"
  yandex: '' // Yandex Webmaster → Meta tag → content="…"
}

// ponytail: all three locales are bundled (~1 KB gz); lazy-load like site.*.ts if this grows
const SEO = { uz, ru, en }

const clip = (s: string, max: number) => {
  if (s.length <= max) return s
  const cut = s.slice(0, max - 1)
  const i = cut.lastIndexOf(' ')
  return (i > 0 ? cut.slice(0, i) : cut).replace(/[,;:.\s]+$/, '') + '…'
}
const fit = (...titles: string[]) => titles.find((t) => t.length <= 60) ?? clip(titles[titles.length - 1]!, 60)

/** All head tags for the current route (called once in app.vue). Fully SSR, prerendered. */
export const useSeo = () => {
  const route = useRoute()
  const locale = useLocale()
  const t = useSite()

  useHead(() => {
    const l = locale.value
    const s = SEO[l]
    const base = stripLocale(route.path)
    const url = (x: Locale) => (SITE_URL + prefixed(x, base)).replace(/(.)\/$/, '$1')
    const home = url(l).replace(/\/projects\/.*$/, '')
    const project = t.value.projects.find((p) => p.slug === route.params.slug)

    const org = {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: brand,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      email,
      description: s.orgDescription,
      areaServed: 'UZ',
      address: { '@type': 'PostalAddress', addressLocality: t.value.site.city, addressCountry: 'UZ' },
      sameAs: socials.map((x) => x.href)
    }
    const website = { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: brand, inLanguage: [...LOCALES], publisher: { '@id': org['@id'] } }

    let title: string, description: string, keywords: string, graph: object[]
    if (project) {
      title = fit(`${project.title} — ${project.summary} | ${brand}`, `${project.title} — ${project.summary}`, `${project.title} — ${project.tags.join(', ')} | ${brand}`)
      description = clip(`${project.summary}. ${project.description}`, 160)
      keywords = [...project.tags, ...project.stack, s.project.keywords].join(', ')
      graph = [
        org,
        {
          '@type': 'CreativeWork',
          '@id': `${url(l)}#work`,
          name: project.title,
          headline: title,
          description,
          url: url(l),
          inLanguage: l,
          dateCreated: String(project.year),
          keywords,
          creator: { '@id': org['@id'] }
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: s.breadcrumbHome, item: home },
            { '@type': 'ListItem', position: 2, name: project.title, item: url(l) }
          ]
        }
      ]
    } else {
      ;({ title, description, keywords } = s.home)
      graph = [
        {
          ...org,
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: s.home.catalogName,
            itemListElement: t.value.services.map((x) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: x.title, description: x.sub, provider: { '@id': org['@id'] }, areaServed: 'UZ' }
            }))
          }
        },
        website
      ]
    }

    const verify = [
      SITE_VERIFICATION.google && { name: 'google-site-verification', content: SITE_VERIFICATION.google },
      SITE_VERIFICATION.yandex && { name: 'yandex-verification', content: SITE_VERIFICATION.yandex }
    ].filter((m): m is { name: string; content: string } => !!m)

    return {
      htmlAttrs: { lang: l },
      title,
      link: [
        { rel: 'canonical', href: url(l) },
        ...LOCALES.map((x) => ({ rel: 'alternate' as const, hreflang: x, href: url(x) })),
        { rel: 'alternate', hreflang: 'x-default', href: url(DEFAULT_LOCALE) }
      ],
      meta: [
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { name: 'robots', content: 'index, follow, max-image-preview:large' },
        { property: 'og:site_name', content: brand },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url(l) },
        { property: 'og:locale', content: s.ogLocale },
        ...LOCALES.filter((x) => x !== l).map((x) => ({ property: 'og:locale:alternate', content: SEO[x].ogLocale })),
        ...(project ? [{ property: 'og:type', content: 'article' }] : []),
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        ...verify
      ],
      script: [{ key: 'ld', type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }]
    }
  })
}
