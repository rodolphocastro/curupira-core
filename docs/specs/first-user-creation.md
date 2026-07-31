# Spec: First User Creation

Status: Accepted

## Purpose

Creating the first user is the first step on getting Curupira to work to an audience.

This feature should trigger whenever there are no "regular" users on PocketBase, and it won't ever be triggered again
once there's the first user in the database.

It should ensure that:

- The user knows that the underlying system is running 
- By the time it finishes, at least one user exists within the database
- It sets up the stage so "default" settings may be created by someone at a later point

### Gating mechanism

The frontend can't query the `users` collection to check "are there no other Users" before anyone
is logged in, since listing/viewing `users` isn't publicly readable. Instead, the flow is gated on
a `settings` collection: a single record with a `firstUserCreated` boolean field, readable by
anyone (so the gate can be checked pre-login) but only creatable/updatable/deletable by an
authenticated user. The First User writes `firstUserCreated: true` to it themselves, right after
their account is created and they're auto-logged-in — which is also the seed record for
["default" settings](set-up-defaults.md) mentioned above.

There won't be any type of RBAC on Curupira, we expect the First User to be a regular user. It just so happens to be
the first one and the one able to (later) set up the defaults for the whole instance.

## Behavior

This spec assumes that [the system has booted successfully](system-boot.md).

Assume that the Version is the same one as what's stated on [package.json](../../package.json).

The portal being served means that PocketBase was able to apply migrations and, thus, is healthy - it can be assumed
as "healthy" for now.

```gherkin
Feature: First User Creation

  Background:
    Given the system has booted successfully
    And there are no other Users in the database
    And the "settings" collection has no record with "firstUserCreated" set to true

  Scenario: First user navigates to Curupira
    When the First User opens Curupira on a browser
    Then the First User should be greeted with the Welcome Page
    And the Welcome Page should report the following data
      | Expected Fields          |
      | Current Curupira Version |
      | Status of Migrations     |
    And the Welcome Page should contain a button that reads "Set Curupira Up"

  Scenario: First user gets to the Set-Up Account page
    Given the First User is on the Welcome Page
    When the First User clicks the "Set Curupira Up" button
    Then the First User should be greeted with the Set-Up Account Page
    And the Set-Up Account Page should contain a form to create a new user
    And the Set-Up Account Page should contain a button that reads "Create User"

  Scenario: First user submits their own Account with valid credentials
    Given the First User is on the Set-Up Account Page
    And the First User has filled the Create User Form with valid data for PocketBase auth
      | Field    | Value           |
      | email    | tester@test.com |
      | password | Not_S@f3_!!     |
    When the First User submits the Create User form
    Then the First User should be stored on the database
    And the First User should not be a PocketBase "superuser"
    And the First User should be logged in automatically
    And a "settings" record should be created with "firstUserCreated" set to true

  Scenario: First user submits their own Account with invalid credentials
    Given the First User is on the Set-Up Account Page
    And the First User has filled the Create User Form with invalid data for PocketBase auth
      | Field    | Value           |
      | email    | tester@test.com |
      | password | 123             |
    When the First User submits the Create User form
    Then an error should be shown describing why it failed
    And the First User should not be stored on the database
    And the First User should stay on the Set-Up Account Page

```

## Out of Scope

- Setting up an instance's defaults (covered by [Setting up defaults](set-up-defaults.md))

## Open Questions

- Is there a chance of user creation failing?
  - ~~If that happens how do we recover? Probably worth is own scenario~~
  - If it fails we just trigger this flow again

---