# Docs

This directory contains documentation for the project, both ADRs and Specs.

- `decisions/` - Contain ADRs (Architectural Decisions Records) that tell why something was built in a given way
- `specs/` - Contain Module / Feature descriptions and what they are meant to do

Files within those directories should use `kebab-case` for their names.

## ADRs

1. Before refactoring or adding something new, check [decisions](./decisions) for anything that might constrain the approach
2. If a change breaks an existing ADR a new ADR should be created to document the change and the old one should have its status changed to `Superseded by ...`
3. New architecturally relevant decisions should be documented in a new ADR
4. ADRs should read as a historical log, unlike Specs

### What is Architecturally relevant?

In short, any decision that might be expensive to change later on or what might be hard to remember "why" is worth an ADR.

Example of events that might warrant an ADR:

- Picking a test framework
- Database or Broker choices
- Project's structure
- Breaking API / Data Contract changes

## Specs

Specs describe current intent and are not meant to be a historical log such as ADRs.

Within [specs](./specs) there may be subdirectories. Each subdirectory is meant to be a "module" that groups together
specs that are relatives.

For instance, the [bootstrap](./specs/bootstrap) module groups together the "first boot" behavior of the system.

## Templates

[000-template.md](./decisions/000-template.md) is a template for creating new ADRs.

[template.md](./specs/template.md) is a template for creating new Specs.
