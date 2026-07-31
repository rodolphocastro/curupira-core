<!-- Actual text should replace stuff within {{}} when writing the ADR -->
# ADR-003: Use Reka UI instead of Radix Vue

Date: 2026-07-30

Status: Accepted

## Context

[ADR-002](002-design-standards.md) picked Radix Vue as the headless, accessible primitives
library to pair with Tailwind CSS for the Welcome, Set-Up Account, and Login pages. Radix Vue has
since been renamed/forked to **Reka UI** by its maintainer, with Radix Vue itself no longer
maintained under that name. This surfaced while implementing the first real UI work
([First User Creation](../specs/first-user-creation.md)), which is when the design stack from
ADR-002 was first actually installed.

## Decision

Use `reka-ui` wherever ADR-002 said "Radix Vue" — same headless/unstyled primitives, same
Tailwind-only styling approach, just the maintained package. Nothing else in ADR-002 changes:
Tailwind, the indigo/slate palette, Radix Icons, and the rest of the design standard stand as-is.

`reka-ui` is added as a dependency now. However, the first pages built (Welcome, Set-Up Account,
All-Set placeholder) are plain forms/text and don't need any interactive primitive from it yet —
it's in place for the first component that does (dialogs, dropdowns, etc.). Radix Icons is not
pulled in yet for the same reason: no icon is needed by the current pages.

## Consequences

- This decision supersedes ADR-002's "Component behavior" bullet (Radix Vue); the rest of
  ADR-002 is unaffected and stays Accepted.
- No visible behavior change yet, since no component uses either library's primitives in this
  round of work.

## Additional Information

- [Reka UI docs](https://reka-ui.com/)
- Radix Vue's own docs/repo now point to Reka UI as its successor.

---
