# Glossary

Terms used in the monorepo consolidation spec ([`docs/specs/001-migrate-monorepo.md`](docs/specs/001-migrate-monorepo.md)) and the decisions in [`docs/adr/`](docs/adr/).

**Core**
The database-independent part of the library: the upgrade engine, builder, script providers and journal abstractions. It lives in `src/Core` after the migration and ships as the `dbbump-core` package. Every provider depends on it by project reference. Avoid "DbUp core" for this, because that means the upstream `dbup-core` package.

**Provider**
A library that adds support for one database engine to the core. There are eight: SqlServer, PostgreSql, MySql, Sqlite, Oracle, Firebird, Redshift and ClickHouse. Each lives in `src/<Provider>` with its tests in `tests/<Provider>` and ships as its own `dbbump-<provider>` package. Avoid "driver" or "plugin".

**Unified version**
The single package version shared by every package the repository publishes. One release gives the core and all eight providers the same version, even when a provider has not changed. It comes from one place (GitVersion and Git tags such as `v1.0.0`) and no provider can set its own.

**Import manifest**
`upstream/manifest.json`. For each provider it records the upstream repository URL, the full commit SHA that was imported and the destination paths, and whether history was preserved. It is the only link between the monorepo and upstream, and later upstream fixes are applied as diffs from the SHA it holds.
