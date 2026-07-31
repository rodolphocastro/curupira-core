// Browser-driven e2e coverage for docs/specs/first-user-creation.md (happy path only —
// see src/views/__tests__/SetupAccountView.spec.ts and src/router/__tests__/guard.spec.ts
// for the invalid-credentials and redirect-guard branches, covered as Vitest unit tests).
//
// Like e2e/boot.spec.ts, this spins up the real `backend/pocketbase` binary against an
// isolated, throwaway data directory (via the same helpers/pocketbase.ts) and drives it
// with a real browser `page`, so a real first-user account actually gets created against
// a real backend rather than a mocked one — this is intentionally heavier than the rest of
// the e2e suite and only runs under the `chromium` project (see playwright.config.ts).
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { test, expect } from '@playwright/test'
import { bootPocketBase, waitUntilHealthy, type BootedPocketBase } from './helpers/pocketbase'

const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const migrationsDir = join(repoRoot, 'backend', 'pb_migrations')

test.describe('First User Creation', () => {
  let instance: BootedPocketBase | undefined

  test.afterEach(async () => {
    await instance?.stop()
    instance = undefined
  })

  test('walks the Welcome -> Set-Up Account flow and records the settings flag', async ({
    page,
  }) => {
    test.setTimeout(60_000)

    execFileSync('pnpm', ['run', 'build-only'], { cwd: repoRoot, stdio: 'inherit' })

    instance = bootPocketBase({ migrationsDir, port: 8093 })
    await waitUntilHealthy(instance.url)

    await page.goto(instance.url + '/')
    await page.waitForURL(instance.url + '/welcome')

    await expect(page.getByText('Status of Migrations')).toBeVisible()
    await expect(page.getByText('Healthy')).toBeVisible()

    await page.getByRole('button', { name: 'Set Curupira Up' }).click()
    await page.waitForURL(instance.url + '/setup-account')

    await page.locator('#email').fill('tester@test.com')
    await page.locator('#password').fill('Not_S@f3_!!')
    await page.locator('#passwordConfirm').fill('Not_S@f3_!!')
    await page.getByRole('button', { name: 'Create User' }).click()

    await page.waitForURL(instance.url + '/')
    await expect(page.getByText('Curupira is set up')).toBeVisible()

    const settingsRes = await fetch(instance.url + '/api/collections/settings/records')
    const settings = await settingsRes.json()
    expect(settings.items).toHaveLength(1)
    expect(settings.items[0].firstUserCreated).toBe(true)

    const authRes = await fetch(instance.url + '/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'tester@test.com', password: 'Not_S@f3_!!' }),
    })
    const auth = await authRes.json()
    expect(authRes.status).toBe(200)
    expect(auth.record.collectionName).toBe('users')
  })
})
