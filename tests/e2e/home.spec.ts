import { expect, test } from '@playwright/test'

const collectErrors = (page: import('@playwright/test').Page) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    // ignore network noise (offline CI / blocked font CDN) and headless-GPU warnings
    if (m.type() === 'error' && !/Failed to load resource|fonts\.(googleapis|gstatic)|WebGL|GPU/i.test(m.text())) {
      errors.push(m.text())
    }
  })
  return errors
}

test.describe('home page', () => {
  test('renders hero, WebGL canvas and all sections without errors', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Excel')
    await expect(page.locator('canvas.webgl__canvas')).toBeAttached()

    for (const id of ['intro', 'services', 'projects', 'pricing', 'contact']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
    }
    await expect(page.locator('[data-scene]')).toHaveCount(7)
    expect(errors, errors.join('\n')).toEqual([])
  })

  test('contact modal opens, traps Escape and closes', async ({ page }) => {
    await page.goto('/')
    // wait for the preloader to finish
    await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 8000 })

    const trigger = page.getByRole('button', { name: 'Bepul audit olish' }).first()
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('Ismingiz')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('FAQ accordion toggles aria-expanded', async ({ page }) => {
    await page.goto('/')
    const q = page.locator('#faq-q-1')
    await q.scrollIntoViewIfNeeded()
    await expect(q).toHaveAttribute('aria-expanded', 'false')
    await q.click()
    await expect(q).toHaveAttribute('aria-expanded', 'true')
  })
})

test.describe('project pages', () => {
  test('project card navigates to a case study and to the next project', async ({ page }) => {
    await page.goto('/projects/ijro-pro')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('IjroPro')
    await page.getByText('keyingi loyiha').click()
    await expect(page).toHaveURL(/\/projects\/savdo-360/)
  })

  test('unknown project shows the 404 page', async ({ page }) => {
    await page.goto('/projects/does-not-exist')
    await expect(page.getByText('Sahifa topilmadi')).toBeVisible()
  })
})
