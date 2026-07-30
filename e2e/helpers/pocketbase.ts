import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const pocketbaseBin = join(repoRoot, 'backend', 'pocketbase')

export interface BootOptions {
  /** Directory PocketBase should load migrations from. */
  migrationsDir: string
  /** Directory PocketBase should serve static files from. Defaults to backend/pb_public. */
  publicDir?: string
  port: number
}

export interface BootedPocketBase {
  url: string
  /** Combined stdout+stderr captured so far. */
  readonly output: string
  /** Resolves with the process exit code once it exits (or has already exited). */
  waitForExit(): Promise<number | null>
  /** Stops the process (if still running) and removes its temp data dir. */
  stop(): Promise<void>
}

function assertBinaryExists() {
  if (!existsSync(pocketbaseBin)) {
    throw new Error(
      `backend/pocketbase not found at "${pocketbaseBin}". ` +
        'It is never committed to the repo and must be placed there manually ' +
        '(see backend/README.md) before these e2e tests can run.',
    )
  }
}

/**
 * Spawns the real `backend/pocketbase` binary against an isolated, throwaway data
 * directory so tests never touch backend/pb_data or a running `pnpm dev` instance.
 */
export function bootPocketBase(options: BootOptions): BootedPocketBase {
  assertBinaryExists()

  const dataDir = mkdtempSync(join(tmpdir(), 'curupira-pb-data-'))
  const hooksDir = mkdtempSync(join(tmpdir(), 'curupira-pb-hooks-'))
  const publicDir = options.publicDir ?? join(repoRoot, 'backend', 'pb_public')

  const child: ChildProcessWithoutNullStreams = spawn(
    pocketbaseBin,
    [
      'serve',
      `--http=127.0.0.1:${options.port}`,
      `--dir=${dataDir}`,
      `--migrationsDir=${options.migrationsDir}`,
      `--publicDir=${publicDir}`,
      `--hooksDir=${hooksDir}`,
    ],
    { stdio: 'pipe' },
  )

  let output = ''
  child.stdout.on('data', (chunk: Buffer) => {
    output += chunk.toString()
  })
  child.stderr.on('data', (chunk: Buffer) => {
    output += chunk.toString()
  })

  const exitPromise = new Promise<number | null>((resolve) => {
    child.on('exit', (code) => resolve(code))
  })

  const cleanupDirs = () => {
    rmSync(dataDir, { recursive: true, force: true })
    rmSync(hooksDir, { recursive: true, force: true })
  }

  return {
    url: `http://127.0.0.1:${options.port}`,
    get output() {
      return output
    },
    waitForExit: () => exitPromise,
    stop: async () => {
      if (child.exitCode === null && !child.killed) {
        child.kill()
      }
      await exitPromise
      cleanupDirs()
    },
  }
}

/** Polls the health endpoint until PocketBase accepts connections, or throws on timeout. */
export async function waitUntilHealthy(url: string, timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/api/health`)
      if (res.ok) return
    } catch {
      // not accepting connections yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`PocketBase at ${url} did not become healthy within ${timeoutMs}ms`)
}
