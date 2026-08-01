// Browser-driven e2e coverage for docs/specs/set-up-defaults.md and docs/specs/login.md
// (happy path only — see the SetupDefaultsView.spec.ts/LoginView.spec.ts/guard.spec.ts Vitest
// suites for validation and redirect-guard branches).
//
// The Welcome -> Set-Up Account walk is already covered end-to-end by
// e2e/first-user-creation.spec.ts, so this test reaches the "authenticated, first user created,
// defaults not set" starting state via direct API calls instead of re-walking that UI, then
// drives only the Set-Up Defaults UI. It closes the loop by also exercising Login for real
// (clearing the session and logging back in) within the same backend+browser boot, rather than
// paying for a third one.
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { test, expect } from '@playwright/test'
import { bootPocketBase, waitUntilHealthy, type BootedPocketBase } from './helpers/pocketbase'

const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const migrationsDir = join(repoRoot, 'backend', 'pb_migrations')

const EMAIL = 'tester@test.com'
const PASSWORD = 'Not_S@f3_!!'

async function createFirstUserViaApi(baseUrl: string) {
  await fetch(baseUrl + '/api/collections/users/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, passwordConfirm: PASSWORD }),
  })

  const authRes = await fetch(baseUrl + '/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
  })
  const auth = await authRes.json()

  await fetch(baseUrl + '/api/collections/settings/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth.token },
    body: JSON.stringify({ firstUserCreated: true }),
  })

  return auth as { token: string; record: unknown }
}

test.describe('Set-up Defaults and Login', () => {
  let instance: BootedPocketBase | undefined

  test.afterEach(async () => {
    await instance?.stop()
    instance = undefined
  })

  test('saves instance defaults, then closes the loop through Login', async ({ page }) => {
    test.setTimeout(60_000)

    execFileSync('pnpm', ['run', 'build-only'], { cwd: repoRoot, stdio: 'inherit' })

    instance = bootPocketBase({ migrationsDir, port: 8094 })
    await waitUntilHealthy(instance.url)

    const auth = await createFirstUserViaApi(instance.url)

    // Seed the browser's PocketBase auth store so the app sees an authenticated session,
    // without going through the Login UI (that's exercised later in this same test). Done via
    // a throwaway navigation + page.evaluate rather than addInitScript, since an init script
    // reruns on every subsequent navigation/reload and would silently undo the "close the loop"
    // logout further down.
    await page.goto(instance.url + '/api/health')
    await page.evaluate(
      ({ token, record }) => {
        window.localStorage.setItem('pocketbase_auth', JSON.stringify({ token, record }))
      },
      { token: auth.token, record: auth.record },
    )

    await page.goto(instance.url + '/')
    await page.waitForURL(instance.url + '/setup-defaults')

    await expect(page.getByText('Instance Name')).toBeVisible()
    await expect(page.getByText('Allow Users to Sign-up?')).toBeVisible()

    await page.locator('#instance-name-input').fill('Acme-Corp')
    await page.locator('#self-sign-up-input').check()
    await page.getByRole('button', { name: 'Save' }).click()

    await page.waitForURL(instance.url + '/')

    const settingsRes = await fetch(instance.url + '/api/collections/settings/records')
    const settings = await settingsRes.json()
    expect(settings.items).toHaveLength(1)
    expect(settings.items[0]).toMatchObject({
      firstUserCreated: true,
      instanceName: 'Acme-Corp',
      allowUserSignUp: true,
      readyToWork: true,
    })

    // Close the loop: clear the session and log back in for real through the Login UI.
    await page.evaluate(() => window.localStorage.removeItem('pocketbase_auth'))
    await page.reload()
    await page.waitForURL(instance.url + '/login')

    await page.locator('#email').fill(EMAIL)
    await page.locator('#password').fill(PASSWORD)
    await page.getByRole('button', { name: 'Log In' }).click()

    await page.waitForURL(instance.url + '/')
    await expect(page.getByText('Instance defaults are set')).toBeVisible()
  })
})
