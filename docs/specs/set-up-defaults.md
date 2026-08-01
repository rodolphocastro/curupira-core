# Spec: Set-up Defaults

Status: Draft

## Purpose

Setting up defaults guides the first user into making their Curupira Instance their own, allowing other users into the
system and setting up the basic "look-and-feel".

This needs to be done before any other users can log into the system.

### Gating mechanism

To tell this feature should be toggled, we need to look at the `settings` collection and figure out if the existing
 document within that collection has the `readyToWork` flag set to `true`.

That flag should, then, be set at the end of this routine. Any subsequent access to Curupira will then follow those
settings to tune the user experience across the platform.

Since there's no RBAC on Curupira, future users may be able to change those – and that's okay.

### Important Settings that must be set before other users join

- `instanceName` - sets the "name" for this instance, which will be displayed across the application and web page's title
- `allowUserSignUp` - allows future users to self-sign up if `true`, otherwise it'll require another user to invite them in

## Behavior

This spec assumes that [the system has booted successfully](system-boot.md) and that [there's a single user](first-user-creation.md).

```gherkin
Feature: Setting up defaults

  Background:
    Given instance defaults are not set
    And there's only one user in the system
    And there's no currently authenticated user
    And the "settings" collection's document has "readyToWork" set to "false"

  Scenario: Redirect users to login but prevent sign-ups
    When the user browses to any page
    Then they should be redirected to the login page
    And there shouldn't be an option to "sign-up"

  Scenario: First User is redirected to the Set-up Defaults page until the system is set
    Given the user is in the Login Page
    When the user logs into the system with valid credentials
      | Field    | Value           |
      | email    | tester@test.com |
      | password | Not_S@f3_!!     |
    Then the user is redirected to the Set-Up Defaults Page
    And the user should see the following fields on the Set-Up Defaults page:
      | ID                  | Label                   | Tooltip                                        |
      | instance-name-input | Instance Name           | What should we call your Curupira instance?    |
      | self-sign-up-input  | Allow Users to Sign-up? | Should we allow users to sign-up on their own? |
    And the user should see a button to "Save" changes

  Scenario: First User should be able to save valid Set-Up Defaults
    Given the First User is on the Set-Up Defaults page
    And the First User has filled the Set-Up Defaults form with valid data
      | Field           | Value     |
      | instanceName    | Acme Corp |
      | allowUserSignUp | true      |
    When the First User clicks "Save"
    Then the "settings" record should have the following attributes set:
      | Attribute       | Value     |
      | instanceName    | Acme Corp |
      | allowUserSignUp | true      |
      | readyToWork     | true      |
    And the First User should be redirected to the Home Page

  Scenario: First User shouldn't be able to set invalid Set-Up Defaults
    Given the First User is on the Set-Up Defaults P
    And the First User has left the Set-Up Defaults form with invalid data
      | Field        | Value |
      | instanceName |       |
    When the First User clicks "Save"
    Then an error should be shown describing why it failed
    And the "settings" record should not be updated
    And the First User should stay on the Set-Up Defaults Page

```

## Out of Scope

- Inviting new users
- Setting up the first entities in the system

## Open Questions

- ~~How do we handle future defaults?~~
  - Probably at the collection level we make everything have a default value or be nullable
- ~~Where should the First User land after successfully saving the Set-Up Defaults?~~
  - Home page, which will have its own spec later
- What makes `instanceName` invalid beyond being blank — any length/format rules?

---