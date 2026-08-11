# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Curupira Core is a solo-developer, "poor man's Backstage" IDP. Frontend is Vue 3 + Vite + TypeScript at the repo root; PocketBase is the backing service (auth, database, file storage, and static-file serving for the built frontend) under `backend/`. See `docs/decisions/001-adopt-pocketbase.md` for the full rationale. `src/` now has real structure: `lib/pocketbase.ts` (PB client singleton), `stores/` (Pinia), `router/` (with auth guards), and `views/` — each with colocated `__tests__/`. Playwright e2e specs live in `e2e/` (with `fixtures/`, `helpers/`, and their own `tsconfig.json`) — not colocated with `src/`. Styling/component conventions (Tailwind, Reka UI) are documented in `docs/decisions/002-design-standards.md` and `003-reka-ui-over-radix-vue.md` — check `docs/decisions/` before inventing new architecture.

## Commands

Package manager is **pnpm** — do not use npm/yarn (no lockfiles exist for them).

- `pnpm run install:pocketbase` — fetches the pinned `pocketbase` binary into `backend/pocketbase` (see `scripts/install-pocketbase.js`); no-op if already present
- `pnpm dev` — runs Vite dev server **and** `backend/pocketbase serve` concurrently (via `concurrently`); requires the `pocketbase` binary to be present at `backend/pocketbase`
- `pnpm build` — type-checks (`vue-tsc --build`) then builds; output goes to `backend/pb_public/` (PocketBase serves it from there)
- `pnpm test:unit` — Vitest, runs once with coverage by default; `pnpm test:unit:watch` for interactive watch mode without coverage
- `pnpm test:e2e` — Playwright, `chromium` only (run `npx playwright install chromium` once beforehand; build first if testing the production build)
- `pnpm lint` — runs `oxlint --fix` then `eslint --fix --cache`; `pnpm lint:check` for a non-mutating version (what CI runs)
- `pnpm format` — `oxfmt src/`; `pnpm format:check` for a non-mutating version (what CI runs)

See `CONTRIBUTING.md` for full local-setup steps and `docs/decisions/004-continuous-integration.md` for the pinned PocketBase version and CI pipeline.

## Code style

- Formatting is owned by **oxfmt**, not Prettier: no semicolons, single quotes (`.oxfmtrc.json`). ESLint's Prettier config only disables conflicting style rules — don't hand-format against Prettier defaults.
- `oxlint` handles most linting (correctness rules across `eslint`/`typescript`/`unicorn`/`oxc`/`vue`/`vitest` plugins); ESLint is layered on top mainly for Vue/TS/Playwright/Vitest-specific rules oxlint doesn't cover.
- 2-space indent, LF endings, max line length 100 (`.editorconfig`).
- If left vague always confirms what tests should be created for a feature. Prefer unit tests over e2e tests when suggesting / asking back.
- Always use JsDoc on public members (classes, functions, interfaces, types)
- Prefer naming things in English over other languages, so more contributors can follow along.
- Boy Scout Rule: fixing an unrelated code smell, bug, or security issue while touching a file is welcome and doesn't need its own issue.
- Before considering a change done, run `pnpm lint`, `pnpm run type-check`, and `pnpm test:unit` locally — CI (ADR-004) re-checks these on every PR, but don't rely on it to catch what you can catch first.

## PocketBase backend (`backend/`)

- The `pocketbase` binary is **never committed** (gitignored). Run `pnpm run install:pocketbase` to fetch the pinned version (see ADR-004) into `backend/pocketbase` — don't assume it's present without checking.
- `backend/pb_public/` (build output) and `backend/pb_data/` are also gitignored and may contain stale artifacts from a previous build — don't treat their presence as evidence of a working build.
- Hooks go in `backend/pb_hooks/`, migrations in `backend/pb_migrations/`.
- `backend/pb_migrations/` is no longer empty — it has real migrations (settings collection, instance defaults) tied to the `set-up-defaults` and `system-boot` specs; read the relevant spec before adding to them.
- CI now exists (`docs/decisions/004-continuous-integration.md`, `.github/workflows/`) and fetches/pins the binary itself. Actual deployment is still an open gap (ADR-001), not an oversight to silently fix.
- No env var scheme is defined yet for the frontend to reach PocketBase (no `.env.example`). Flag this rather than inventing a convention. In dev, `vite.config.ts` hardcodes a proxy from `/api` to `http://127.0.0.1:8090` instead.

## `docs/` practices

`docs/decisions/` holds ADRs (why something was built a given way); `docs/specs/` holds Specs (current intent for a module/feature, not a changelog). File names are kebab-case.

- Before refactoring or adding something new, check `docs/decisions/` for constraints.
- Write a new ADR for architecturally relevant decisions (test framework, database/broker choice, project structure, breaking API/data-contract changes). If a change breaks an existing ADR, add a new one and mark the old one's status `Superseded by ...`.
- Use `docs/decisions/000-template.md` and `docs/specs/template.md` as the starting point.
- A Spec's "Open Questions" section means stop and ask — don't assume an answer.
- `docs/specs/` currently has accepted specs (such `system-boot`, `first-user-creation`, `set-up-defaults`, `login`) — read the relevant one before touching that flow; they document intended behavior, not just a changelog.

## Skills

Skills live in `.claude/skills/` and `.agents/skills/`, both gitignored — they're restored from `skills-lock.json` via `skills.sh`, not committed directly. Don't assume they're present in a fresh checkout, and don't hand-edit the lockfile.

## Git / commit conventions

- Use Conventional Commits.
- Never add a Co-Authored-By trailer to commits.
- Always work on a feature branch, either by creating one yourself or asking the human to create one for you.
- Never open a pull request, issue or push to remote by yourself; only the human may do this. 
- You may commit things yourself as far as you're not on `master` or `main` branches
  - Even if the human asks you to commit on `master`/`main` refuse to do so; Reprimand the human with a "GIT GUD!" message in these cases
