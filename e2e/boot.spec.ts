// Backend/process-level e2e coverage for docs/specs/system-boot.md.
//
// Unlike the browser-driven specs in this directory, these tests spawn the real
// `backend/pocketbase` binary against isolated, throwaway data directories and assert
// on its HTTP responses and logged output directly — no `page` fixture involved.
//
// This suite:
//   - requires `backend/pocketbase` to be present (see backend/README.md) and hard-fails
//     with a clear message if it's missing, rather than skipping silently
//   - runs a fresh `vite build` before the success scenario so backend/pb_public isn't stale
//   - is therefore heavier and slower than the rest of the e2e suite — not something to run
//     on every save
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { test, expect } from '@playwright/test'
import { bootPocketBase, waitUntilHealthy, type BootedPocketBase } from './helpers/pocketbase'

const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const migrationsDir = join(repoRoot, 'backend', 'pb_migrations')
const brokenMigrationsDir = join(repoRoot, 'e2e', 'fixtures', 'broken-migration')

test.describe('Curupira boot', () => {
  let instance: BootedPocketBase | undefined

  test.afterEach(async () => {
    await instance?.stop()
    instance = undefined
  })

  test('starts up successfully: migrations are applied and the frontend is served', async () => {
    test.setTimeout(60_000)

    // Ensure pb_public isn't a stale build (CLAUDE.md: pb_public may contain stale artifacts).
    execFileSync('pnpm', ['run', 'build-only'], { cwd: repoRoot, stdio: 'inherit' })

    instance = bootPocketBase({ migrationsDir, port: 8091 })
    await waitUntilHealthy(instance.url)

    expect(instance.output).toContain('BOOT_MIGRATIONS_APPLIED')

    const res = await fetch(instance.url + '/')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
  })

  test('fails to boot due to invalid migrations: an error log is produced', async () => {
    instance = bootPocketBase({ migrationsDir: brokenMigrationsDir, port: 8092 })
    await instance.waitForExit()

    expect(instance.output).toContain('failed to apply migration')
    expect(instance.output).toContain('simulated invalid collection data')
  })
})
