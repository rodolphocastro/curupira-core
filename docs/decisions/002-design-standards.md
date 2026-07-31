# ADR-002: Design standards (typography, palette, styling, icons)

Date: 2026-07-29

Status: Accepted (Component behavior bullet superseded by [ADR-003](003-reka-ui-over-radix-vue.md))

## Context

The `src/` tree is still unmodified `create-vue` scaffolding with no established design or UX conventions. Every
future screen (starting with the Welcome, Set-Up Account, and Login pages from the self-provisioning specs) would
otherwise be styled ad hoc, with no shared basis for color, type, or spacing.

I'm a solo developer and a UX novice, so the standard needs to be straightforward to apply correctly without design
judgment calls at each step, and cheap to maintain, consistent with the "poor man's Backstage" / `#simple` ethos
from [ADR-001](001-adopt-pocketbase.md).

## Decision

- **Typography**: the OS system font stack (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), no
  custom webfont. A small type scale (3-4 sizes) and two weights (400 regular, 600 semibold).
- **Palette**: Tailwind's default `indigo` scale as the brand/primary color, `slate` as the neutral scale, and
  Tailwind's default `red`/`green`/`amber` for semantic error/success/warning colors. Light mode only for now.
  Dark mode is deferred, not ruled out.
- **Styling**: Tailwind CSS for all layout, spacing, and color utility classes. No pre-styled component library
  (e.g. Vuetify, PrimeVue).
- **Component behavior**: ~~Radix Vue~~ [Reka UI](003-reka-ui-over-radix-vue.md) (Radix Vue's
  successor) for headless, accessible primitives (dialogs, menus, dropdowns, etc.), behavior and
  accessibility only, styled entirely with our own Tailwind classes.
- **Spacing**: Tailwind's default spacing scale (4px base unit), not a custom one.
- **Icons**: Radix Icons, for visual consistency with the Radix Vue primitives.
- **Accessibility baseline**: WCAG AA contrast (4.5:1 for body text) is a hard constraint on any palette or theme
  change.

## Consequences

- Tailwind needs to be added to the build (PostCSS config, Vite plugin, `tailwind.config`). New build tooling
  that didn't exist before.
- Radix Vue needs to be added as a dependency for any interactive component (dialog, dropdown, etc.).
- No component library means every styled component (buttons, form fields, etc.) is hand-built on top of Radix
  Vue's unstyled primitives. More upfront work per component, but full control over markup and styling.
- Sticking to Tailwind's default color scales (rather than custom hex values) keeps the palette low-maintenance
  and pre-verified for contrast, at the cost of a less distinctive brand identity.
- Adding dark mode later means revisiting every color usage to add a `dark:` variant — real but bounded, scoped
  rework rather than a redesign.

## Additional Information

- [Tailwind CSS docs](https://tailwindcss.com/docs)
- [Radix Vue docs](https://www.radix-vue.com/)
- [Radix Icons](https://www.radix-ui.com/icons)
- [WCAG 2.1 contrast guidance](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---
