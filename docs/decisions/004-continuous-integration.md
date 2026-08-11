# ADR-004: Continuous Integration

Date: 2026-10-08

Status: Accepted

## Context

As specs are growing, it can get tiresome to rely solely on local environments and word of mouth on Pull Requests that
"my changes work".

Also, since this project is serving as a prototype for a spec-driven-development, this means that harnesses are solely
validated at the local level and any changes to how they are run can be hard to track and reproduce.

So we need to set up a proper continuous integration pipeline and system to ensure that:

- Changes are validated on every PR before hitting `master`
- Changes to every `master` commit are validated before being ready to a deployment
- Minimal work is needed to set up development, testing or production environments

Right now this project's main repository is hosted on GitHub, which provides a free and easy-to-use continuous pipeline
service called GitHub Actions.

## Decision

We should use GitHub Actions as our Continuous Integration provider.

There should be the following pipelines on the following events:

- Whenever a pull request targeting `master` is opened or receives changes;
- Whenever a commit is pushed to `master`;

For each event the following actions should be validated:

| Name                        | Runs on PRs? | Runs on Commits? | Note                                                                              |
|-----------------------------|--------------|------------------|-----------------------------------------------------------------------------------|
| Restore Pocketbase          | Yes          | Yes              | PocketBase should be cached to prevent long run times                             |
| Restore Node dependencies   | Yes          | Yes              | Node dependencies should be cached to prevent long run times                      |
| Restore Playwright browsers | Yes          | Yes              | Should be cached!                                                                 |
| Build                       | Yes          | Yes              |                                                                                   |
| Format check                | Yes          | No               |                                                                                   |
| Lint check                  | Yes          | No               |                                                                                   |
| Unit Tests                  | Yes          | Yes              | Should capture code coverage for unit and integration tests                       |
| E2E Tests                   | Yes          | Yes              | Shouldn't capture code coverage                                                   |

Restoring PocketBase should assume we're always in a UNIX environment, Windows developers should stick to WSL v2 to
contribute to the project.

SonarQube won't be added for now as `oxfmt` pretty much covers us.

Coverage reports should be reported on the Action itself. No need for build artifacts at the moment.

## Consequences

- Create js scripts to fetch PocketBase binaries and files into the [backend directory](../../backend)
    - Create shortcuts to `pnpm run install:pocketbase`
    - It is fine to hardcode to the latest available version and Unix variants
- Coverage tooling should be added to ensure unit and integration tests coverage is captured
- Pipelines need to be created on [GitHub's folder](../../.github/workflows):
    - The "PR" pipeline
    - The "Master Commit" pipeline

## Additional Information

N.A. 

---