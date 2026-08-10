# Spec: Login

Status: Accepted

## Purpose

Login lets an existing user authenticate into Curupira with their PocketBase credentials. It's
the gateway every other flow redirects to once [the first user exists](bootstrap/first-user-creation.md)
but the current visitor has no active session — including gating access while
[instance defaults aren't set up yet](bootstrap/set-up-defaults.md).

## Behavior

This spec assumes [the system has booted successfully](bootstrap/system-boot.md) and that
[the first user has already been created](bootstrap/first-user-creation.md).

```gherkin
Feature: Login

  Background:
    Given the system has booted successfully
    And the first user has already been created
    And there's no currently authenticated user
    And instance's defaults are set

  Scenario: Unauthenticated user is redirected to Login
    When the user browses to any page that requires a session
    Then they should be redirected to the Login Page
    And the Login Page should contain fields for "email" and "password"
    And the Login Page should contain a button that reads "Log In"

  Scenario: Sign-up is never offered while instance defaults aren't set
    Given the "settings" collection's document has "readyToWork" set to "false"
    When the user is on the Login Page
    Then there shouldn't be an option to "sign-up"

  Scenario: User logs in with valid credentials
    Given the user is on the Login Page
    And the user has filled the Login Form with valid credentials
      | Field    | Value           |
      | email    | tester@test.com |
      | password | Not_S@f3_!!     |
    When the user submits the Login form
    Then the user should be authenticated
    And the user should be redirected onward based on the "settings" collection's "readyToWork" flag

  Scenario: User logs in with invalid credentials
    Given the user is on the Login Page
    And the user has filled the Login Form with invalid credentials
      | Field    | Value           |
      | email    | tester@test.com |
      | password | wrong-password  |
    When the user submits the Login form
    Then a generic error should be shown that doesn't reveal whether the email or the password was wrong
    And the user should not be authenticated
    And the user should stay on the Login Page

```

## Out of Scope

- Self sign-up itself (registering a new account from the Login Page) - should be its own spec
- "Forgot password" / credential recovery.
- Any rate-limiting or lockout beyond whatever PocketBase already does by default.
- Logout (belongs with whichever page ends up being the authenticated Home).
- Where exactly an authenticated, "ready" user lands (the Home Page) — that's its own
  not-yet-written spec, same forward reference [Set-up Defaults](bootstrap/set-up-defaults.md) already makes.

## Open Questions

- ~~Does the combined `firstUserCreated` × `readyToWork` × auth-state routing matrix warrant its
  own ADR?~~
  - No — it's a straightforward extension of the existing Vue Router + Pinia guard pattern from
    [First User Creation](bootstrap/first-user-creation.md); the state matrix is documented in the specs
    themselves, not a separate ADR.

---
