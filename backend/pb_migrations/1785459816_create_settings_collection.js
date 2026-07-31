/// <reference path="../pb_data/types.d.ts" />
// Backs docs/specs/first-user-creation.md: a singleton-style record here is what the
// frontend gates the Welcome/Set-Up Account flow on, since reading the "users" collection
// isn't possible pre-auth. Read is public so the flow can be gated before login; writes
// require an authenticated user (the newly created first user writes it right after signup).
migrate(
  (app) => {
    const collection = new Collection({
      type: 'base',
      name: 'settings',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'firstUserCreated',
          type: 'bool',
        },
      ],
    })
    app.save(collection)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('settings'))
  },
)
