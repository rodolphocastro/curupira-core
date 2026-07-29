/// <reference path="../pb_data/types.d.ts" />
// Placeholder migration proving the apply-on-boot mechanism works (docs/specs/system-boot.md).
// No schema changes yet — no collection is specified anywhere in the specs.
migrate(
  (app) => {
    console.log('BOOT_MIGRATIONS_APPLIED')
  },
  (app) => {
    console.log('BOOT_MIGRATIONS_REVERTED')
  },
)
