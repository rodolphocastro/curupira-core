import { test, expect } from '@playwright/test'

// Smoke test against the shared dev server/data (see e2e/first-user-creation.spec.ts for the
// full, isolated happy-path flow). Whether the first user already exists in this shared dev
// data depends on local history, so this only asserts the app boots into one of its two known
// landing states rather than a specific one.
test('visits the app root url and lands on a known page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText(/Welcome to Curupira|Curupira is set up/)
})
