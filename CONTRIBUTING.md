# Contributing to Curupira

Thanks for considering contributing! This document covers how to get a local environment running
and how contributions are expected to flow.

## AI-assisted development

AI-assisted development is welcome. What isn't welcome is contributions that are purely AI
output with no one behind them who understands it. As a contributor — human or agent-assisted —
you're expected to always understand what you're proposing and why it was done a certain way, and
to be able to explain it if asked.

## Prerequisites

- **Node.js**: `^22.18.0` or `>=24.12.0` (see `engines` in `package.json`)
- **pnpm**: is the only supported package manager — do not use npm or yarn, no lockfiles exist for
  them. If you don't have it, [install it](https://pnpm.io/installation)
- **PocketBase**: fetched automatically for you (see step 2 below) — no manual download needed.
- **`unzip`**: needed by the PocketBase install script. Present by default on macOS, Linux, and
  WSL2.
- **Unix environment**: PocketBase installation only supports macOS/Linux. On Windows, use WSL2
  to contribute (see [ADR-004](docs/decisions/004-continuous-integration.md)).

## Local setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Fetch the pinned `pocketbase` binary into `backend/pocketbase`:

   ```bash
   pnpm run install:pocketbase
   ```

   This binary is gitignored and never committed — the script (`scripts/install-pocketbase.js`)
   downloads the version pinned in [ADR-004](docs/decisions/004-continuous-integration.md) and is
   safe to re-run (it's a no-op if `backend/pocketbase` already exists).

3. Start the app — this runs the Vite dev server and `pocketbase serve` together:

   ```bash
   pnpm dev
   ```

4. Open `http://localhost:5173`. On a fresh instance (no users yet) you'll land on the Welcome
   page; walking through Set-Up Account and then Set-Up Defaults gets you to a working instance.
   See [docs/specs/](docs/specs/) for what each of those flows is meant to do.

5. If you ever need to start afresh, delete the `backend/pb_data/` directory.

## Running tests

- Unit tests (Vitest) — runs once and reports coverage by default:

  ```bash
  pnpm test:unit
  ```

  For interactive watch mode (no coverage) while developing, use `pnpm test:unit:watch` instead.

- End-to-end tests (Playwright) — only `chromium` is supported (see
  [ADR-004](docs/decisions/004-continuous-integration.md)). Install it once beforehand:

  ```bash
  npx playwright install chromium
  ```

  Some OSes also need system dependencies for the browser to launch
  (`npx playwright install-deps chromium`, may require `sudo`). Then:

  ```bash
  pnpm test:e2e
  ```

  A few heavier e2e specs spin up a real `backend/pocketbase` process against a throwaway data
  directory and run a production build first, they're intentionally not run on every save. See
  the comments at the top of `e2e/boot.spec.ts`, `e2e/first-user-creation.spec.ts`, and
  `e2e/set-up-defaults.spec.ts` for what each covers and make sure to comment in a similar way if you create similar 
 tests.

## Code style

- Formatting is owned by **oxfmt**, not Prettier: no semicolons, single quotes. Run `pnpm format`
  to fix in place, or `pnpm format:check` for a non-mutating check (what CI runs).
- Linting: `pnpm lint` (runs `oxlint --fix` then `eslint --fix --cache`) to fix in place, or
  `pnpm lint:check` for a non-mutating check (what CI runs).
- 2-space indent, LF line endings, max line length 100 (see `.editorconfig`).
- Public members (classes, functions, interfaces, types) should have JsDoc comments.
- Prefer unit tests over e2e tests where a unit test can cover the same behavior.
- Whenever possible, prefer naming things in English to ensure more people may understand it and contribute to the project.

Run `pnpm lint`, `pnpm run type-check`, and `pnpm test:unit` locally before opening a PR. CI (see
[ADR-004](docs/decisions/004-continuous-integration.md)) runs the equivalent checks on every PR,
but catching issues locally first means a faster feedback loop.

### Boy Scout Rule

Whenever you see a code smell, a potential bug or even a security issue, feel free to fix it. You aren't obligated to, 
but it helps! No need to create an issue when you do that as part of your contribution to a feature or a bug.

## Before making a change

- Check [docs/decisions/](docs/decisions/) (ADRs) for constraints before refactoring or adding
  new architecture, they document *why* something was built a given way.
- Check [docs/specs/](docs/specs/) for the current intended behavior of the module/feature you're
  touching.
- If your change is architecturally relevant (test framework, database/broker choice, project
  structure, breaking API/data-contract changes), add a new ADR alongside it. If it breaks an
  existing ADR's decision, that ADR's `Status` should be updated to `Superseded by ...` rather
  than silently going stale.
- If a Spec has an "Open Questions" entry relevant to your change, that means stop and ask rather
  than assume an answer.

## Git & commits

- Always work on a feature branch or on a fork, never commit directly to `master`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
- Keep commits scoped to one logical change rather than bundling unrelated work together.

## Submitting changes

Curupira currently has one maintainer. Open a pull request against `master`; it'll be
reviewed personally. Please make sure `pnpm lint`, `pnpm run type-check`, and `pnpm test:unit`
pass locally first.

## Reporting issues

Open a GitHub issue. Include what you expected to happen, what actually happened, and how to
reproduce it.
