import { test, expect } from '@playwright/test'

// Smoke test against the shared dev server/data (see e2e/first-user-creation.spec.ts and
// e2e/set-up-defaults.spec.ts for the full, isolated happy-path flows). A fresh browser context
// has no session, so an unauthenticated visitor can only ever land on Welcome (no first user
// yet) or Login (first user already exists) — never the authenticated-only All-Set placeholder.
// Whether the first user already exists in this shared dev data depends on local history, so
// this only asserts one of those two reachable states rather than a specific one.
test('visits the app root url and lands on a known page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText(/Welcome to Curupira|Log In/)
})
