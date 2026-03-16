import { test, expect } from '@playwright/test'

test.describe('DarkChess Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads successfully with title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('暗棋')
  })

  test('shows difficulty selector on start screen', async ({ page }) => {
    await expect(page.locator('.difficulty-buttons')).toBeVisible()
    await expect(page.locator('.diff-btn')).toHaveCount(3)
  })

  test('can select difficulty and start game', async ({ page }) => {
    await page.locator('.diff-btn', { hasText: 'Easy' }).click()
    await page.locator('.start-btn').click()
    await expect(page.locator('.board')).toBeVisible()
  })

  test('shows board with 32 cells after starting', async ({ page }) => {
    await page.locator('.start-btn').click()
    const cells = page.locator('.cell')
    await expect(cells).toHaveCount(32)
  })

  test('shows coordinates (row labels A-D and col labels 1-8)', async ({ page }) => {
    await page.locator('.start-btn').click()
    await expect(page.locator('.row-label', { hasText: 'A' })).toBeVisible()
    await expect(page.locator('.row-label', { hasText: 'D' })).toBeVisible()
    await expect(page.locator('.col-label', { hasText: '1' })).toBeVisible()
    await expect(page.locator('.col-label', { hasText: '8' })).toBeVisible()
  })

  test('can click a face-down piece to flip it', async ({ page }) => {
    await page.locator('.start-btn').click()
    const firstCell = page.locator('.cell').first()
    await firstCell.click()
    await expect(page.locator('.piece--red, .piece--black').first()).toBeVisible()
  })

  test('displays current turn info', async ({ page }) => {
    await page.locator('.start-btn').click()
    await expect(page.locator('.status-bar')).toBeVisible()
  })

  test('can restart the game', async ({ page }) => {
    await page.locator('.start-btn').click()
    await page.locator('.restart-btn-sm').click()
    await expect(page.locator('.board')).toBeVisible()
  })
})
