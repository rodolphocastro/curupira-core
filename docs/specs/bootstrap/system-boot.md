# Spec: System Boot

Status: Accepted

## Purpose

The system should be simple to boot but guarantee it is in a valid state and ready to be accessed by its users and extensions.

That means we need to assert that:

- Important `collections` are created in the database
- The appropriate files for hooks are present, if any
- The appropriate frontend bundle is present

## Behavior

Important:
- PocketBase is the underlying database and backend infrastructure
- Curupira is the "bundle" of PocketBase plus our own Frontend and its logics

So 'starting' Curupira means that PocketBase is also started as it is the backing service.

```gherkin
Feature: Self Provisioning on Boot
  
  Background: 
    Given PocketBase is not running
  
  Scenario: Curupira starts up successfully
    When Curupira is started
    Then PocketBase should apply all its pending migrations
    And PocketBase should serve the built-in frontend

  Scenario: Curupira fails to boot due to invalid migrations
    Given PocketBase has invalid collection data
    When Curupira is started
    Then an error log reading "migrations failed" along with the cause should be produced

```

## Out of Scope

- Guide the first user on setting up his instance (covered by [first user spec](first-user-creation.md))


## Open Questions
<!-- Anything still undecided. An agent should stop and ask rather than assume here. Delete a line once it's answered -->

- Is ensuring migrations are up enough?
- How to effectively restore the system if a migration happens to fail?

---