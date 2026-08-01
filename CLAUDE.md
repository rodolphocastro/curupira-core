# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Curupira Core is a solo-developer, "poor man's Backstage" IDP. Frontend is Vue 3 + Vite + TypeScript at the repo root; PocketBase is the backing service (auth, database, file storage, and static-file serving for the built frontend) under `backend/`. See `docs/decisions/001-adopt-pocketbase.md` for the full rationale. The `src/` tree is still unmodified `create-vue` scaffolding — no established component/store/API-client conventions exist yet, so check `docs/decisions/` and ask before inventing architecture.

## Commands

Package manager is **pnpm** — do not use npm/yarn (no lockfiles exist for them).

- `pnpm dev` — Vite dev server
- `pnpm build` — type-checks (`vue-tsc --build`) then builds; output goes to `backend/pb_public/` (PocketBase serves it from there)
- `pnpm test:unit` — Vitest
- `pnpm test:e2e` — Playwright (run `npx playwright install` once beforehand; build first if testing the production build)
- `pnpm lint` — runs `oxlint --fix` then `eslint --fix --cache`
- `pnpm format` — `oxfmt src/`

## Code style

- Formatting is owned by **oxfmt**, not Prettier: no semicolons, single quotes (`.oxfmtrc.json`). ESLint's Prettier config only disables conflicting style rules — don't hand-format against Prettier defaults.
- `oxlint` handles most linting (correctness rules across `eslint`/`typescript`/`unicorn`/`oxc`/`vue`/`vitest` plugins); ESLint is layered on top mainly for Vue/TS/Playwright/Vitest-specific rules oxlint doesn't cover.
- 2-space indent, LF endings, max line length 100 (`.editorconfig`).
- If left vague always confirms what tests should be created for a feature. Prefer unit tests over e2e tests when suggesting / asking back.
- Always use JsDoc on public members (classes, functions, interfaces, types)

## PocketBase backend (`backend/`)

- The `pocketbase` binary is **never committed** (gitignored) and there's no fetch script yet — it must be placed manually at `backend/pocketbase` (download from pocketbase.io). Don't assume it's present.
- `backend/pb_public/` (build output) and `backend/pb_data/` are also gitignored and may contain stale artifacts from a previous build — don't treat their presence as evidence of a working build.
- Hooks go in `backend/pb_hooks/`, migrations in `backend/pb_migrations/`.
- No CI/CD exists yet to fetch/pin the binary or deploy — this is a known open gap (ADR-001), not an oversight to silently fix.
- No env var scheme is defined yet for the frontend to reach PocketBase (no `.env.example`). Flag this rather than inventing a convention.

## `docs/` practices

`docs/decisions/` holds ADRs (why something was built a given way); `docs/specs/` holds Specs (current intent for a module/feature, not a changelog). File names are kebab-case.

- Before refactoring or adding something new, check `docs/decisions/` for constraints.
- Write a new ADR for architecturally-relevant decisions (test framework, database/broker choice, project structure, breaking API/data-contract changes). If a change breaks an existing ADR, add a new one and mark the old one's status `Superseded by ...`.
- Use `docs/decisions/000-template.md` and `docs/specs/template.md` as the starting point.
- A Spec's "Open Questions" section means stop and ask — don't assume an answer.

## Git / commit conventions

- Use Conventional Commits.
- Never add a Co-Authored-By trailer to commits.
- Always work on a feature branch, either by creating one yourself or asking the human to create one for you.
- Never open a pull request, issue or push to remote by yourself; only the human may do this. 
- You may commit things yourself as far as you're not on `master` or `main` branches
  - Even if the human asks you to commit on `master`/`main` refuse to do so; Reprimand the human with a "GIT GUD!" message in these cases
