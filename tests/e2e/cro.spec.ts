import { expect, test, type Page, type Route } from '@playwright/test'

const L = { uz: '', ru: '/ru', en: '/en' } as const
const EP = '**/lead-relay.example.workers.dev/**'
const settle = (p: Page) => expect(p.locator('.preloader')).toHaveCount(0, { timeout: 8000 })
const heroCta = (p: Page) => p.locator('[data-cta="hero"]')
const dialog = (p: Page) => p.getByRole('dialog')

async function openModal(p: Page) {
  await heroCta(p).scrollIntoViewIfNeeded()
  await heroCta(p).click()
  await expect(dialog(p)).toBeVisible()
}
async function fillValid(p: Page) {
  const d = dialog(p)
  await d.getByLabel('Ismingiz').fill('Test User')
  await d.getByLabel(/Telefon/).fill('+998901234567')
  await d.getByRole('checkbox').check()
}
const submit = (p: Page) => dialog(p).locator('[data-cta="submit"]').click()
const mockLead = (p: Page, handler: (r: Route) => unknown) => p.route(EP, handler as never)

test.describe('CRO: content & structure', () => {
  test('US-5 hero: outcome H1, primary CTA, Telegram link, no legacy strings', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Excel')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(heroCta(page)).toHaveText(/Bepul audit olish/)
    const tg = page.locator('[data-cta="telegram"]')
    await expect(tg).toContainText('Telegramda yozish')
    await expect(tg).toHaveAttribute('href', /t\.me\//)
    await expect(tg).toHaveAttribute('target', '_blank')
    const text = await page.evaluate(() => document.body.textContent || '')
    expect(text).not.toContain('(IT-yechimlar')
    expect(text).not.toContain('pastga')
    expect(text).not.toContain('Loyihani muhokama')
  })

  test('US-6/7/12 data-cta attributes present on home', async ({ page }) => {
    await page.goto('/')
    for (const [k, n] of [['hero', 1], ['header', 1], ['section', 3], ['contact', 1], ['telegram', 1]] as const) {
      await expect(page.locator(`[data-cta="${k}"]`), k).toHaveCount(n)
    }
    await settle(page)
    await openModal(page)
    await expect(page.locator('[data-cta="submit"]')).toHaveCount(1)
  })

  test('US-7 section CTAs sit inside projects, process, faq', async ({ page }) => {
    await page.goto('/')
    const ids = await page
      .locator('[data-cta="section"]')
      .evaluateAll((els) => els.map((e) => e.closest('section')?.getAttribute('data-scene')))
    expect(ids.sort()).toEqual(['faq', 'process', 'projects'])
  })

  for (const loc of Object.keys(L) as (keyof typeof L)[]) {
    test(`US-7 ${loc}: SectionCta on a project page opens modal`, async ({ page }) => {
      await page.goto(`${L[loc]}/projects/ijro-pro`)
      await settle(page)
      const cta = page.locator('[data-cta="section"]')
      await expect(cta).toHaveCount(1)
      await cta.scrollIntoViewIfNeeded()
      await cta.click()
      await expect(dialog(page)).toBeVisible()
    })
  }

  test('US-9 services: exactly 4 cards, each with bullets', async ({ page }) => {
    await page.goto('/')
    const cards = page.locator('#services .services__grid > li')
    await expect(cards).toHaveCount(4)
    for (let i = 0; i < 4; i++) expect(await cards.nth(i).locator('ul li').count(), `card ${i}`).toBeGreaterThanOrEqual(1)
    await expect(page.locator('#services').getByRole('heading', { name: 'Qaysi jarayonni tartibga solamiz?' })).toBeVisible()
  })

  test('US-12 nav order and #pricing anchor', async ({ page, isMobile }) => {
    await page.goto('/')
    await settle(page)
    await expect(page.locator('section#pricing')).toBeAttached()
    if (isMobile) await page.getByRole('button', { name: 'Menyuni ochish' }).click()
    const links = page.getByRole('navigation').filter({ hasText: 'Xizmatlar' }).first().getByRole('link')
    await expect(links).toHaveText([/Xizmatlar$/, /Loyihalar$/, /Narxlar$/, /Aloqa$/])
    await expect(links.nth(2)).toHaveAttribute('href', /#pricing$/)
  })

  test('US-8 no clients marquee; NDA badge on every project card; placeholder outline off', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[class*="marquee"]')).toHaveCount(0)
    const cards = page.locator('#projects a[href*="/projects/"]')
    const n = await cards.count()
    expect(n).toBeGreaterThanOrEqual(6)
    await expect(page.locator('#projects .badge')).toHaveCount(n)
    await expect(page.locator('html[data-show-placeholders]')).toHaveCount(0)
    const outline = await page.locator('[data-placeholder]').first().evaluate((e) => getComputedStyle(e).outlineStyle)
    expect(outline).toBe('none')
  })
})

test.describe('CRO: modal', () => {
  test('opens from hero CTA, focus lands in and stays trapped', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await openModal(page)
    await expect(dialog(page).getByLabel('Ismingiz')).toBeFocused()
    await expect(page.locator('#__nuxt')).toHaveAttribute('inert', '')
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('#__nuxt')), `tab ${i}`).toBe(false)
    }
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toBeHidden()
    await expect(heroCta(page)).toBeFocused()
  })

  test('empty submit shows 3 inline errors with aria-invalid; no request sent', async ({ page }) => {
    let calls = 0
    await mockLead(page, (r) => (calls++, r.fulfill({ status: 204 })))
    await page.goto('/')
    await settle(page)
    await openModal(page)
    await submit(page)
    await expect(dialog(page).locator('.field__err')).toHaveCount(3)
    await expect(dialog(page).locator('[aria-invalid="true"]')).toHaveCount(3)
    expect(calls).toBe(0)
  })

  test('budget chips none pressed, consent unchecked on reopen; honeypot hidden', async ({ page }) => {
    await page.goto('/')
    await settle(page)
    await openModal(page)
    const d = dialog(page)
    await expect(d.locator('.chip')).not.toHaveCount(0)
    await expect(d.locator('.chip[aria-pressed="true"]')).toHaveCount(0)
    const hp = d.locator('input[name="website"]')
    await expect(hp).toHaveAttribute('tabindex', '-1')
    await expect(hp).toHaveAttribute('autocomplete', 'off')
    expect(await hp.evaluate((e) => !!e.closest('[aria-hidden="true"]'))).toBe(true)
    await d.locator('.chip').first().click()
    await expect(d.locator('.chip[aria-pressed="true"]')).toHaveCount(1)
    await d.getByRole('checkbox').check()
    await page.keyboard.press('Escape')
    await expect(d).toBeHidden()
    await openModal(page)
    await expect(d.locator('.chip[aria-pressed="true"]')).toHaveCount(0)
    await expect(d.getByRole('checkbox')).not.toBeChecked()
    await expect(d.getByRole('checkbox')).toHaveAttribute('required', '')
  })
})

test.describe('CRO: lead flow', () => {
  test('204 -> exactly one POST with payload, success view', async ({ page }) => {
    const bodies: Record<string, unknown>[] = []
    await mockLead(page, (r) => {
      bodies.push(JSON.parse(r.request().postData() || '{}'))
      return r.fulfill({ status: 204 })
    })
    await page.goto('/')
    await settle(page)
    await openModal(page)
    await fillValid(page)
    await submit(page)
    await expect(dialog(page).getByRole('link', { name: /Telegramda yozish/ })).toBeVisible()
    await expect(dialog(page).getByRole('alert')).toHaveCount(0)
    expect(bodies).toHaveLength(1)
    expect(bodies[0]).toMatchObject({ name: 'Test User', contact: '+998901234567', locale: 'uz', page: '/', hp: '' })
    expect(bodies[0]!.budget).toBeFalsy()
  })

  test('500 -> error alert, Telegram link, form kept, retry works', async ({ page }) => {
    let calls = 0
    await mockLead(page, (r) => r.fulfill({ status: ++calls === 1 ? 500 : 204 }))
    await page.goto('/')
    await settle(page)
    await openModal(page)
    await fillValid(page)
    await submit(page)
    const alert = dialog(page).getByRole('alert')
    await expect(alert).toBeVisible()
    const tg = alert.getByRole('link', { name: /Telegramda yozish/ })
    await expect(tg).toHaveAttribute('target', '_blank')
    await expect(tg).toHaveAttribute('rel', /noopener/)
    await expect(dialog(page).getByLabel('Ismingiz')).toHaveValue('Test User')
    await expect(dialog(page).locator('[data-cta="submit"]')).toBeEnabled()
    await submit(page)
    await expect(dialog(page).locator('.modal__done')).toBeVisible()
    expect(calls).toBe(2)
  })

  test('network failure -> error state, never fake success', async ({ page }) => {
    await mockLead(page, (r) => r.abort('failed'))
    await page.goto('/')
    await settle(page)
    await openModal(page)
    await fillValid(page)
    await submit(page)
    await expect(dialog(page).getByRole('alert')).toBeVisible()
    await expect(dialog(page).locator('.modal__done')).toHaveCount(0)
  })

  test('honeypot filled -> no request', async ({ page }) => {
    let calls = 0
    await mockLead(page, (r) => (calls++, r.fulfill({ status: 204 })))
    await page.goto('/')
    await settle(page)
    await openModal(page)
    await fillValid(page)
    await dialog(page)
      .locator('input[name="website"]')
      .evaluate((e: HTMLInputElement) => {
        e.value = 'spam'
        e.dispatchEvent(new Event('input'))
      })
    await submit(page)
    await expect(dialog(page).locator('.modal__done')).toBeVisible()
    expect(calls).toBe(0)
  })

  test('second submit within 30 s -> throttled, no second request', async ({ page }) => {
    let calls = 0
    await mockLead(page, (r) => (calls++, r.fulfill({ status: 204 })))
    await page.goto('/')
    await settle(page)
    await openModal(page)
    await fillValid(page)
    await submit(page)
    await expect(dialog(page).locator('.modal__done')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toBeHidden()
    await page.waitForTimeout(700) // modal resets state 600 ms after close
    await openModal(page)
    await fillValid(page)
    await submit(page)
    await expect(dialog(page).locator('.modal__alert')).toBeVisible()
    await expect(dialog(page).locator('.modal__alert').getByRole('link')).toHaveCount(0)
    await expect(dialog(page).getByRole('alert')).toHaveCount(0)
    expect(calls).toBe(1)
  })
})

// visible (unclipped) overflow only
for (const [name, vp] of [['390', { width: 390, height: 844 }], ['1440', { width: 1440, height: 900 }]] as const) {
  for (const loc of Object.keys(L) as (keyof typeof L)[]) {
    test(`no visible horizontal overflow at ${name} on ${L[loc] || '/'}`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.goto(L[loc] || '/')
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
    })
  }
}
