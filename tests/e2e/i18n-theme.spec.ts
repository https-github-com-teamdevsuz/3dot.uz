import { expect, test, type Page } from '@playwright/test'

const L = { uz: '', ru: '/ru', en: '/en' } as const
type Loc = keyof typeof L
const OG = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' }
const TITLE = { uz: /Bepul audit/, ru: /бесплатный аудит/, en: /free audit/ }
const SITE = 'https://3dot.uz'
const UZ_ONLY = ['Bepul audit', 'Telegramda yozish', 'Ismingiz', 'Sahifa topilmadi', 'raqamlashtiramiz']

const theme = (p: Page) => p.evaluate(() => document.documentElement.dataset.theme)
const settle = (p: Page) => expect(p.locator('.preloader')).toHaveCount(0, { timeout: 8000 })
const toggleBtn = (p: Page) =>
  p.getByRole('button', { name: /Switch to (light|dark) theme|Переключить|Yorug|Qorong/i }).first()
const html = (p: Page) => p.locator('html')

// US-1, US-4, US-13: prerendered locale routes + head metadata
for (const loc of Object.keys(L) as Loc[]) {
  test(`US-1/4/13 ${loc}: lang, canonical, hreflang, og`, async ({ page, request }) => {
    const path = L[loc] || '/'
    expect((await request.get(path)).status()).toBe(200)
    await page.goto(path)
    await expect(html(page)).toHaveAttribute('lang', loc)
    await expect(page).toHaveTitle(TITLE[loc])
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', SITE + L[loc])
    for (const [h, href] of [['uz', SITE], ['ru', SITE + '/ru'], ['en', SITE + '/en'], ['x-default', SITE]]) {
      await expect(page.locator(`link[rel=alternate][hreflang="${h}"]`)).toHaveAttribute('href', href!)
    }
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', OG[loc])
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', TITLE[loc])
    expect(await page.locator('meta[property="og:description"]').getAttribute('content')).toBeTruthy()
    expect(await page.locator('meta[name=description]').getAttribute('content')).toBeTruthy()
  })

  test(`US-1/4 ${loc}: project page prerendered, translated head`, async ({ page, request }) => {
    const path = `${L[loc]}/projects/ijro-pro`
    expect((await request.get(path)).status()).toBe(200)
    await page.goto(path)
    await expect(html(page)).toHaveAttribute('lang', loc)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('IjroPro')
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', SITE + path)
    await expect(page.locator('link[rel=alternate][hreflang="x-default"]')).toHaveAttribute(
      'href',
      SITE + '/projects/ijro-pro'
    )
    expect(await page.locator('meta[property="og:description"]').getAttribute('content')).toBeTruthy()
    expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toContain('IjroPro')
  })
}

test('US-1 slash-less locale routes (ru.html) are served', async ({ request }) => {
  expect((await request.get('/ru')).status()).toBe(200)
  expect((await request.get('/en')).status()).toBe(200)
})

// US-5
for (const loc of ['ru', 'en'] as const) {
  test(`US-5 ${loc}: no uz-only phrases`, async ({ page }) => {
    await page.goto(L[loc])
    const text = await page.evaluate(() => document.body.textContent || '')
    for (const p of UZ_ONLY) expect(text, p).not.toContain(p)
    expect(text).toMatch(loc === 'ru' ? /Бесплатный аудит/ : /free audit/i)
  })
}

// US-2, US-3, US-13: switcher + persistence
test('US-2/3/13 switcher navigates, stores locale, updates lang', async ({ page, isMobile }) => {
  await page.goto('/projects/ijro-pro')
  await settle(page)
  if (isMobile) await page.getByRole('button', { name: 'Menyuni ochish' }).click()
  const ru = page.getByRole('link', { name: /Русский/ }).last()
  await expect(ru).toHaveAttribute('hreflang', 'ru')
  await expect(ru).toHaveAttribute('lang', 'ru')
  await ru.click()
  await expect(page).toHaveURL(/\/ru\/projects\/ijro-pro\/?$/)
  await expect(html(page)).toHaveAttribute('lang', 'ru')
  expect(await page.evaluate(() => localStorage.getItem('3dot:locale'))).toBe('ru')
  if (isMobile) {
    const open = page.getByRole('button', { name: 'Открыть меню' })
    if (await open.isVisible()) await open.click()
  }
  await expect(page.getByRole('link', { name: /Русский/ }).last()).toHaveAttribute('aria-current', 'true')
})

test('US-3 stored ru/en redirects unprefixed URL', async ({ page }) => {
  for (const l of ['ru', 'en'] as const) {
    await page.addInitScript((v) => localStorage.setItem('3dot:locale', v), l)
    await page.goto('/')
    await expect(page).toHaveURL(new RegExp(`/${l}/?$`))
    await expect(html(page)).toHaveAttribute('lang', l)
    await page.goto('/projects/ijro-pro')
    await expect(page).toHaveURL(new RegExp(`/${l}/projects/ijro-pro/?$`))
  }
})

test('US-3 stored uz stays on /', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('3dot:locale', 'uz'))
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)
  await expect(html(page)).toHaveAttribute('lang', 'uz')
})

test('US-3 no stored choice never redirects (even with ru browser locale)', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'ru-RU' })
  const page = await ctx.newPage()
  await page.goto('/')
  await expect(html(page)).toHaveAttribute('lang', 'uz')
  await ctx.close()
})

// US-7, 8, 9, 12: theme
for (const scheme of ['light', 'dark'] as const) {
  test(`US-7 system ${scheme} sets data-theme before hydration`, async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: scheme })
    const page = await ctx.newPage()
    await page.goto('/', { waitUntil: 'commit' })
    await page.waitForFunction(() => !!document.documentElement.dataset.theme)
    expect(await theme(page)).toBe(scheme)
    await ctx.close()
  })
}

test('US-7/8/9 toggle flips, persists, survives reload, transform none, header fixed', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto('/')
  await settle(page)
  const btn = toggleBtn(page)
  const before = await btn.getAttribute('aria-label')
  await btn.click()
  expect(await theme(page)).toBe('light')
  expect(await page.evaluate(() => localStorage.getItem('3dot:theme'))).toBe('light')
  await expect.poll(() => btn.getAttribute('aria-label')).not.toBe(before)
  await expect(page.getByRole('status').filter({ hasText: /\S/ })).toHaveCount(1)
  const tf = () => page.evaluate(() => getComputedStyle(document.documentElement).transform)
  expect(await tf()).toBe('none')
  await page.evaluate(() => window.scrollTo(0, 2000))
  await page.waitForFunction(() => scrollY > 1000)
  expect(await tf()).toBe('none')
  // header auto-hides on scroll down by design; scrolling up must reveal it pinned at top 0 (fixed, not scrolled away)
  await page.mouse.wheel(0, -200)
  await expect
    .poll(() => page.evaluate(() => document.querySelector('header')!.getBoundingClientRect().top))
    .toBe(0)
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(300)

  const warns: string[] = []
  page.on('console', (m) => /hydrat/i.test(m.text()) && warns.push(m.text()))
  await page.reload({ waitUntil: 'commit' })
  await page.waitForFunction(() => !!document.documentElement.dataset.theme)
  expect(await theme(page)).toBe('light') // stored beats OS dark
  await page.waitForLoadState('load')
  await page.emulateMedia({ colorScheme: 'dark' })
  expect(await theme(page)).toBe('light') // OS change ignored once stored
  expect(warns).toEqual([])
  await ctx.close()
})

test('US-9 no stored choice: OS change updates live', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' })
  const page = await ctx.newPage()
  await page.goto('/')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect.poll(() => theme(page)).toBe('light')
  await ctx.close()
})

test('US-12 theme-color metas and color-scheme', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('meta[name=theme-color]').count()).toBeGreaterThanOrEqual(2)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toMatch(/dark|light/)
})

test('US-11 reduced motion: toggle adds no theme-anim class', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto('/')
  await settle(page)
  await toggleBtn(page).click()
  expect(await page.evaluate(() => document.documentElement.classList.contains('theme-anim'))).toBe(false)
  await ctx.close()
})

// US-2/8/11: keyboard + mobile
test('US-11 keyboard: language link and theme toggle focusable, Enter toggles', async ({ page, isMobile }) => {
  await page.goto('/')
  await settle(page)
  if (isMobile) await page.getByRole('button', { name: 'Menyuni ochish' }).click()
  const link = page.getByRole('link', { name: /English/ }).last()
  await link.focus()
  await expect(link).toBeFocused()
  const btn = toggleBtn(page)
  await btn.focus()
  await expect(btn).toBeFocused()
  const before = await theme(page)
  await page.keyboard.press('Enter')
  expect(await theme(page)).not.toBe(before)
})

test('US-2/8 mobile: pills >=44px, toggle clickable with menu open', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only')
  await page.goto('/')
  await settle(page)
  await page.getByRole('button', { name: 'Menyuni ochish' }).click()
  for (const n of [/zbekcha/, /Русский/, /English/]) {
    const box = await page.getByRole('link', { name: n }).last().boundingBox()
    expect(box!.height, String(n)).toBeGreaterThanOrEqual(44)
    expect(box!.width, String(n)).toBeGreaterThanOrEqual(44)
  }
  const before = await theme(page)
  await toggleBtn(page).click({ timeout: 3000 })
  expect(await theme(page)).not.toBe(before)
})

// US-6: visible (unclipped) overflow only
for (const loc of ['ru', 'en'] as const) {
  test(`US-6 ${loc}: no visible horizontal overflow, header not wrapped`, async ({ page }) => {
    await page.goto(L[loc])
    await settle(page)
    const bad = await page.evaluate(() => {
      const w = innerWidth
      const out: string[] = []
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.right <= w + 1) return
        const cs = getComputedStyle(el)
        if (cs.position === 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') return
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const o = getComputedStyle(p)
          if (o.overflowX !== 'visible' || o.position === 'fixed') return
        }
        out.push(`${el.tagName}.${(el as HTMLElement).className}`)
      })
      return out.slice(0, 5)
    })
    expect(bad).toEqual([])
    expect(await page.evaluate(() => document.querySelector('header')!.getBoundingClientRect().height)).toBeLessThan(140)
  })
}

// US-10 (informational): blob vs #f4f3ee in light mode
test('US-10 (informational) light-mode blob contrast >= 3:1', async ({ browser }, info) => {
  const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto('/')
  await settle(page)
  await page.waitForTimeout(1200)
  const png = await page.screenshot({ path: info.outputPath('light-hero.png') })
  const res = await page.evaluate(async (b64) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + b64
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const g = c.getContext('2d')!
    g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data
    const f = (v: number) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    }
    const bg = 0.895
    let min = bg
    let n = 0
    for (let i = 0; i < d.length; i += 4 * 97) {
      const l = 0.2126 * f(d[i]!) + 0.7152 * f(d[i + 1]!) + 0.0722 * f(d[i + 2]!)
      if (l < bg - 0.1) {
        n++
        if (l < min) min = l
      }
    }
    return { n, ratio: (bg + 0.05) / (min + 0.05) }
  }, png.toString('base64'))
  info.annotations.push({ type: 'informational', description: JSON.stringify(res) })
  test.skip(res.n < 50, 'blob pixels not found (WebGL unavailable headless?)')
  expect(res.ratio).toBeGreaterThanOrEqual(3)
  await ctx.close()
})
