import { expect, test } from '@playwright/test'

test.beforeEach(({}, info) => test.skip(info.project.name === 'mobile', 'desktop pointer/canvas regressions'))

test('LiquidCanvas mounts: sized to viewport and LiquidScene chunk requested', async ({ page }) => {
  // prod chunks are hash-named (no "LiquidScene" in the URL), so match by content: the three.js scene chunk
  const chunks: string[] = []
  page.on('response', async (r) => {
    if (/_nuxt\/.*\.js/.test(r.url()) && /WebGLRenderer/.test(await r.text().catch(() => ''))) chunks.push(r.url())
  })
  await page.goto('/')
  const canvas = page.locator('canvas').first()
  await expect(canvas).toBeAttached()
  await expect.poll(() => canvas.evaluate((c: HTMLCanvasElement) => c.width), { timeout: 10_000 }).toBeGreaterThan(300)
  const vw = page.viewportSize()!.width
  const w = await canvas.evaluate((c: HTMLCanvasElement) => c.width)
  expect(w).toBeGreaterThanOrEqual(vw * 0.9)
  expect(chunks.length).toBeGreaterThan(0)
})

for (const t of ['dark', 'light']) {
  test(`custom cursor visible and contrasting in ${t} theme`, async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 8000 })
    await page.evaluate((v) => (document.documentElement.dataset.theme = v), t)
    await page.mouse.move(400, 300)
    await page.mouse.move(700, 450)
    const dot = page.locator('.cursor__dot')
    const ring = page.locator('.cursor__ring')
    await expect(dot).toBeVisible()
    await expect(ring).toBeVisible()
    const s = await page.evaluate(() => {
      const cs = (sel: string) => getComputedStyle(document.querySelector(sel)!)
      const bgOf = () => {
        for (const el of [document.body, document.documentElement]) {
          const b = getComputedStyle(el).backgroundColor
          if (b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') return b
        }
        return ''
      }
      return {
        dot: cs('.cursor__dot').backgroundColor,
        ring: cs('.cursor__ring').borderTopColor,
        bg: bgOf()
      }
    })
    for (const c of [s.dot, s.ring]) {
      expect(c).not.toBe('rgba(0, 0, 0, 0)')
      expect(c).not.toBe(s.bg)
    }
    expect(s.bg).not.toBe('')
  })
}
