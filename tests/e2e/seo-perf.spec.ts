import { test, expect } from '@playwright/test'

const SITE = 'https://3dot.uz'
const PAGES = [
  { locale: 'uz', home: '/', project: '/projects/ijro-pro', url: SITE },
  { locale: 'ru', home: '/ru', project: '/ru/projects/ijro-pro', url: SITE + '/ru' },
  { locale: 'en', home: '/en', project: '/en/projects/ijro-pro', url: SITE + '/en' }
]

for (const p of PAGES) {
  for (const [kind, path] of [['home', p.home], ['project', p.project]] as const) {
    test(`SEO head: ${p.locale} ${kind}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('h1')).toHaveCount(1)
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
      expect(title.length).toBeLessThanOrEqual(60)
      const meta = (sel: string) => page.locator(sel).first().getAttribute('content')
      const desc = (await meta('meta[name="description"]'))!
      expect(desc.length).toBeGreaterThanOrEqual(140)
      expect(desc.length).toBeLessThanOrEqual(160)
      const expected = SITE + (path === '/' ? '' : path)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expected)
      for (const l of ['uz', 'ru', 'en', 'x-default']) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${l}"]`)).toHaveCount(1)
      }
      expect(await meta('meta[property="og:title"]')).toBeTruthy()
      expect(await meta('meta[property="og:description"]')).toBeTruthy()
      expect(await meta('meta[property="og:locale"]')).toBeTruthy()

      const blobs = await page.locator('script[type="application/ld+json"]').allTextContents()
      expect(blobs.length).toBeGreaterThan(0)
      const types = blobs.flatMap((b) => {
        const j = JSON.parse(b)
        return (j['@graph'] ?? [j]).map((n: any) => n['@type'])
      })
      if (kind === 'home') expect(types).toContain('Organization')
    })
  }
}

test('robots.txt references sitemap', async ({ request }) => {
  const r = await request.get('/robots.txt')
  expect(r.status()).toBe(200)
  expect(await r.text()).toMatch(/^Sitemap:/mi)
})

test('sitemap.xml: 21 well-formed urls with hreflang alternates', async ({ request, page }) => {
  const r = await request.get('/sitemap.xml')
  expect(r.status()).toBe(200)
  const xml = await r.text()
  // well-formedness via the browser's XML parser
  const err = await page.evaluate((x) => new DOMParser().parseFromString(x, 'application/xml').querySelector('parsererror')?.textContent ?? null, xml)
  expect(err).toBeNull()
  const urls = xml.match(/<url>[\s\S]*?<\/url>/g) ?? []
  expect(xml.match(/<loc>/g)).toHaveLength(21)
  expect(urls).toHaveLength(21)
  for (const u of urls) {
    for (const l of ['uz', 'ru', 'en', 'x-default']) expect(u).toContain(`hreflang="${l}"`)
  }
})

test('no Google Fonts requests; Unbounded loads', async ({ page }) => {
  const hosts: string[] = []
  page.on('request', (q) => hosts.push(new URL(q.url()).hostname))
  await page.goto('/')
  const ok = await page.evaluate(async () => {
    await document.fonts.ready
    await document.fonts.load('1em Unbounded')
    return document.fonts.check('1em Unbounded')
  })
  expect(ok).toBe(true)
  expect(hosts.filter((h) => /fonts\.(googleapis|gstatic)\.com/.test(h))).toEqual([])
})

test('ru HTML modulepreloads exactly the ru copy chunk; uz preloads none of it', async ({ request }) => {
  const MARK = 'Вместо бумаги, Excel' // from site.ru.ts heroLead
  const preloads = async (path: string) =>
    ((await (await request.get(path)).text()).match(/<link[^>]+rel="modulepreload"[^>]*>/g) ?? []).map((l) => l.match(/href="([^"]+)"/)![1])
  const uz = await preloads('/')
  const extra = (await preloads('/ru')).filter((h) => !uz.includes(h))
  expect(extra).toHaveLength(1)
  expect(await (await request.get(extra[0])).text()).toContain(MARK)
  for (const h of uz) expect(await (await request.get(h)).text(), h).not.toContain(MARK)
})

for (const path of ['/', '/en']) {
  test(`CLS < 0.05 on ${path}`, async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as any).__cls = 0
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto(path)
    await page.waitForLoadState('load')
    await page.waitForTimeout(1500)
    expect(await page.evaluate(() => (window as any).__cls)).toBeLessThan(0.05)
  })
}
