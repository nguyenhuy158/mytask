import { test, expect } from '@playwright/test'

test.describe('Task Management', () => {
  test('should create a new task via UI button', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/')

    // Wait for the app to be ready
    await expect(page).toHaveTitle(/mytask/i) // Assuming title contains mytask

    // 2. Click [+] NEW_TASK button
    const newButton = page.getByRole('button', { name: /NEW_TASK/i })
    await expect(newButton).toBeVisible({ timeout: 10000 })
    await newButton.click()

    // 3. Fill Add Task Modal
    await expect(page.locator('h2:has-text("Initialize_Task")')).toBeVisible()

    const taskName = `E2E-TASK-${Date.now()}`
    await page.getByPlaceholder('E.g. REFACTOR_AUTH_LAYER').fill(taskName)
    await page.getByPlaceholder('What needs to be done?').fill('Description from Playwright')

    await page.click('button:has-text("[CREATE_TASK]")')

    // 4. Verify task appears in the list
    // Wait for the modal to close and task to appear
    await expect(page.locator('h2:has-text("Initialize_Task")')).not.toBeVisible()

    const taskItem = page.locator(`text=${taskName}`)
    // Wait up to 10s for the list to refresh via WebSocket or re-fetch
    await expect(taskItem).toBeVisible({ timeout: 10000 })
  })

  test('should open command palette via keyboard shortcut', async ({ page }) => {
    await page.goto('/')

    // Try both Control+K and Meta+K for cross-platform compatibility in headless
    await page.keyboard.press('Control+k')

    const palette = page.locator('input[placeholder="Search commands..."]')

    // If Control+K didn't work, try Meta+K
    if (!(await palette.isVisible())) {
      await page.keyboard.press('Meta+k')
    }

    await expect(palette).toBeVisible()
  })
})
