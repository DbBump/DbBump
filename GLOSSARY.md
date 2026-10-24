# Glossary

Terms used in the monorepo consolidation spec ([`docs/specs/001-migrate-monorepo.md`](docs/specs/001-migrate-monorepo.md)) and the decisions in [`docs/adr/`](docs/adr/). Measured facts (provider list, versions, package IDs) are in [`docs/inventory/`](docs/inventory/).

**Core**
The database-independent part of the library: the upgrade engine, builder, script providers and journal abstractions. Every provider depends on it. Avoid "DbUp core" for this, because that means the upstream `dbup-core` package.

**Provider**
A library that adds support for one database engine to the core, with its own tests and its own package. Avoid "driver" or "plugin". The list of providers is in the inventory.

**ADO.NET client package**
The third-party NuGet package that a provider uses to talk to its database, for example `Npgsql`. Avoid "driver package", even where a package's own name contains "Driver".

**Unified version**
The single package version shared by every package the repository publishes. One release gives the core and every provider the same version, even if a provider has not changed.

**Import manifest**
`upstream/manifest.json` (spec section 4.2). For each imported provider repository it records the name, URL, imported revision (full commit SHA), import path, source path and whether history was preserved. Spec section 2.1 also requires the branch or tag, import date, original licence and destination directory to be recorded for each repository. The manifest is the only link between the monorepo and upstream.
