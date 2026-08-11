#!/usr/bin/env node
// Backs docs/decisions/004-continuous-integration.md: fetches the pinned PocketBase binary into
// backend/pocketbase, closing ADR-001's "must be placed manually" gap. Idempotent — if the
// binary is already present (e.g. restored from a CI cache), this is a no-op, which is what
// makes it safe to always run right after a cache-restore step.
import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdtempSync, renameSync, rmSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const POCKETBASE_VERSION = '0.39.9'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const destination = join(repoRoot, 'backend', 'pocketbase')

const PLATFORM_MAP = {
  linux: 'linux',
  darwin: 'darwin',
}

const ARCH_MAP = {
  x64: 'amd64',
  arm64: 'arm64',
}

async function main() {
  if (existsSync(destination)) {
    console.log(`backend/pocketbase already present, skipping install (v${POCKETBASE_VERSION}).`)
    return
  }

  if (process.platform === 'win32') {
    console.error(
      'PocketBase installation only supports Unix environments. On Windows, use WSL2 to ' +
        'contribute to this project (see docs/decisions/004-continuous-integration.md).',
    )
    process.exit(1)
  }

  const os = PLATFORM_MAP[process.platform]
  const arch = ARCH_MAP[process.arch]
  if (!os || !arch) {
    console.error(`Unsupported platform/arch: ${process.platform}/${process.arch}`)
    process.exit(1)
  }

  const assetName = `pocketbase_${POCKETBASE_VERSION}_${os}_${arch}.zip`
  const downloadUrl =
    `https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/` + assetName

  const workDir = mkdtempSync(join(tmpdir(), 'curupira-pocketbase-'))
  const zipPath = join(workDir, assetName)

  try {
    console.log(`Downloading ${downloadUrl} ...`)
    await downloadFile(downloadUrl, zipPath)

    console.log('Extracting ...')
    execFileSync('unzip', ['-q', '-o', zipPath, '-d', workDir])

    const extractedBinary = join(workDir, 'pocketbase')
    if (!existsSync(extractedBinary)) {
      throw new Error(`Expected ${extractedBinary} after extraction, but it wasn't there.`)
    }

    renameSync(extractedBinary, destination)
    chmodSync(destination, 0o755)

    console.log(`Installed backend/pocketbase v${POCKETBASE_VERSION}.`)
  } finally {
    rmSync(workDir, { recursive: true, force: true })
  }
}

async function downloadFile(url, destinationPath) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await writeFile(destinationPath, buffer)
}

await main()
