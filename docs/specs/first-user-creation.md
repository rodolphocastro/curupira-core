# Spec: First User Creation

Status: Draft

## Purpose

Creating the first user is the first step on getting Curupira to work to an audience.

It should ensure that:

- The user knows that the underlying system is running 
- By the time it finishes, at least one user exists within the database
- It sets up the stage so "default" settings may be created by someone at a later point

## Behavior

This spec assumes that [the system has booted successfully](system-boot.md).

```gherkin
Feature: First User Creation

  Background:
    Given the system has booted successfully 
    And there are no other Users in the database

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

  Scenario: First user submits their own Account
    Given the First User is on the Set-Up Account Page
    And the First User has filled the Create User Form with valid data
    When the First User submited its Create User form
    Then the First User should be stored on the database
    And the First User should be logged in automatically

```

## Out of Scope

- Setting up an instance's defaults (covered by [Setting up defaults](set-up-defaults.md))

## Open Questions

- Is there a chance of user creation failing?
  - If that happens how do we recovered? Probably worth is own scenario

---