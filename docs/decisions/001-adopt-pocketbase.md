# ADR-001: Adopt PocketBase as the backing service.

Date: 2026-07-28

Status: Accepted

## Context

Curupira's (name of this project) Core should be a dead-simple deployment that spins up in less than 10 minutes.

It should still be able to support everything an IDP (Internal Developer Portal) needs, but its core should be `#simple`.

Extensibility should be allowed but won't be our driving feature for adoption, we're meant to be a poor man's version
of backstage that allows teams with simpler stacks to get up and running quickly on their IDP journey.

Given that I'm the solo developer on this, I would also like to keep this as close as possible to my favorite tech stack,
which is TypeScript and Vue for frontend itself.

Quality matters so tests must be a first-class citizen.

## Decision
 
To keep things simple and aligned to our current context, we'll be adopting the following tech-stack:

- Vue for the web-portal with its main plugins:
  - Router
  - Pinia
- Pocketbase for Authentication, Database, File Storage and Serving the Frontend
- Playwright for End-to-End Testing
- Vitest for Unit Testing

Deployment will eventually be handled by getting a `pocketbase` binary into the `/backend` directory.

Extensibility should be done by satellite applications writing records into `pocketbase` through its REST API, and we'll
adopt PocketBase's conventions to keep it up and running.

## Consequences

We need to figure out a way to properly get a `pocketbase` binary into the `/backend` directory as part of CI/CD.

Extensibility will be done by satellite applications writing records into `pocketbase` through its REST API.

Eventually we'll need to figure out a way to have extensions toggle based on their satellite / companion being connected
or not with the `extensions` collection on pocketbase.

The `backend/` directory needs to be properly configured to ensure no binaries ever get checked into Git.

We're also going to miss out on better search experiences, but we'll have to live with that for now.

## Additional Information

For comparison, these are the instructions to get [Backstage deployed in production](https://backstage.io/docs/deployment/).

Pocketbase's own documentation is available on [pocketbase.io](https://pocketbase.io/docs).

A sample project to look at is [pocket-chat](https://github.com/PocketTogether/pocket-chat)

---