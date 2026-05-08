import { test, expect } from '@playwright/test'

test.describe('Task Management', () => {
  test('should create a new task via UI button', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/')

    // Wait for the app to be ready
    await expect(page).toHaveTitle(/mytask/i) // Assuming title contains mytask

    // 2. Click [+] NEW_TASK button
    const newButton = page.locator('button', { hasText: /NEW_.*TASK/i })
    await expect(newButton).toBeVisible({ timeout: 20000 })
    await newButton.click()

    // 3. Fill Add Task Modal
    await expect(page.locator('h2', { hasText: /Initialize_Task/i })).toBeVisible()

    const taskName = `E2E-TASK-${Date.now()}`
    await page.getByPlaceholder(/REFACTOR_AUTH_LAYER/i).fill(taskName)
    await page.getByPlaceholder(/What needs to be done/i).fill('Description from Playwright')

    await page.locator('button', { hasText: /CREATE_TASK/i }).click()

    // 4. Verify task appears in the list
    // Wait for the modal to close and task to appear
    await expect(page.locator('h2', { hasText: /Initialize_Task/i })).not.toBeVisible()

    const taskItem = page.locator(`text=${taskName}`)
    // Wait up to 10s for the list to refresh via WebSocket or re-fetch
    await expect(taskItem).toBeVisible({ timeout: 10000 })
  })

  test('should delete a task', async ({ page }) => {
    await page.goto('/')

    // 1. Create a task first to ensure we have something to delete
    const taskName = `DELETE-ME-${Date.now()}`
    const newButton = page.locator('button', { hasText: /NEW_TASK/i })
    await expect(newButton).toBeVisible({ timeout: 20000 })
    await newButton.click()
    await page.getByPlaceholder(/REFACTOR_AUTH_LAYER/i).fill(taskName)
    await page.locator('button', { hasText: /CREATE_TASK/i }).click()

    const taskItem = page.locator(`text=${taskName}`)
    await expect(taskItem).toBeVisible({ timeout: 10000 })

    // 2. Delete the task
    // Handle the confirm dialog
    page.once('dialog', (dialog) => dialog.accept())

    // Find the TaskCard that contains the taskName and click the [DELETE] button inside it
    const taskCard = page
      .locator('div', { hasText: taskName })
      .filter({ has: page.locator('button', { hasText: /DELETE/i }) })
      .first()
    const deleteButton = taskCard.locator('button', { hasText: /DELETE/i })
    await deleteButton.click()

    // 4. Verify it's gone
    await expect(taskItem).not.toBeVisible({ timeout: 10000 })
  })

  test('should move task through statuses in board view', async ({ page }) => {
    await page.goto('/')

    // 1. Create a task
    const taskName = `STATUS-TEST-${Date.now()}`
    const newButton = page.locator('button', { hasText: /NEW_TASK/i })
    await expect(newButton).toBeVisible({ timeout: 20000 })
    await newButton.click()
    await page.getByPlaceholder(/REFACTOR_AUTH_LAYER/i).fill(taskName)
    await page.locator('button', { hasText: /CREATE_TASK/i }).click()
    await expect(page.locator(`text=${taskName}`)).toBeVisible()

    // 2. Switch to BOARD view
    await page.locator('button', { hasText: /BOARD/i }).click()

    // 3. Verify task is in TODO column
    const todoColumn = page
      .locator('div', { has: page.locator('h3', { hasText: /todo/i }) })
      .filter({ has: page.locator(`text=${taskName}`) })
    await expect(todoColumn).toBeVisible()

    // 4. Click [NEXT] to move to DOING
    await todoColumn.locator('button', { hasText: /NEXT/i }).click()

    // 5. Verify task is in DOING column
    const doingColumn = page
      .locator('div', { has: page.locator('h3', { hasText: /doing/i }) })
      .filter({ has: page.locator(`text=${taskName}`) })
    await expect(doingColumn).toBeVisible({ timeout: 10000 })
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
