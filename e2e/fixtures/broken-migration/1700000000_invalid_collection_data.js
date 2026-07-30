/// <reference path="../../../backend/pb_data/types.d.ts" />
// Deliberately broken migration used only by e2e/boot.spec.ts to exercise
// PocketBase's own migration-failure logging (docs/specs/system-boot.md).
// Never copied into backend/pb_migrations.
migrate(
  (app) => {
    throw new Error('simulated invalid collection data')
  },
  (app) => {},
)
