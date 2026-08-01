/// <reference path="../pb_data/types.d.ts" />
// Backs docs/specs/set-up-defaults.md: adds the fields the First User fills in on the
// Set-Up Defaults page to the existing `settings` singleton created by
// 1785459816_create_settings_collection.js (see docs/specs/first-user-creation.md).
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('settings')
    collection.fields.add(
      // Not `required` at the schema level: the `settings` record is first created (by the
      // First User Creation flow) with only `firstUserCreated` set, before instanceName is
      // known. Non-blank is enforced client-side at Set-Up Defaults submission time instead;
      // `pattern` still guards the character set whenever a value *is* provided.
      new TextField({
        name: 'instanceName',
        pattern: '^[a-zA-Z0-9._-]+$',
      }),
      new BoolField({ name: 'allowUserSignUp' }),
      new BoolField({ name: 'readyToWork' }),
    )
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('settings')
    collection.fields.removeByName('instanceName')
    collection.fields.removeByName('allowUserSignUp')
    collection.fields.removeByName('readyToWork')
    app.save(collection)
  },
)
