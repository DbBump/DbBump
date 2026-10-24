# 1. Import the providers with history, then flatten them into `src/<Provider>`

**Status:** Accepted
**Date:** 2026-10-24
**Spec:** [`docs/specs/001-migrate-monorepo.md`](../specs/001-migrate-monorepo.md), sections 3, 4 and 11
**Facts:** [`docs/inventory/001-baseline.md`](../inventory/001-baseline.md)

## Context

The fork holds only the DbUp core. The eight database providers live in separate upstream repositories (`DbUp/dbup-sqlserver`, `-postgresql`, `-mysql`, `-sqlite`, `-oracle`, `-firebird`, `-redshift`, `-clickhouse`). The spec asks for one repository that builds, tests and releases all of them at one version.

Section 4.1 of the spec offers two layouts and asks for the choice to be written down before the migration finishes. The first keeps each import in a stable directory, so `git subtree pull` keeps working. The second moves the files into the monorepo layout, which gives a cleaner tree but makes later subtree pulls hard. The spec also says history preservation and easy upstream sync are separate goals. This record states which was chosen and what it costs.

## Decision

1. **Import with `git subtree add`, full history, no `--squash`.** Each provider is added from its official GitHub URL at the commit recorded in the inventory, on a dedicated integration branch. Upstream commits, authors and dates stay in the log. Submodules are not used.

2. **Then flatten.** After the import is verified, the provider's library moves with `git mv` to `src/<Provider>` and its tests to `tests/<Provider>`. The directory names are `SqlServer`, `PostgreSql`, `MySql`, `Sqlite`, `Oracle`, `Firebird`, `Redshift` and `ClickHouse`. The temporary import directory (for example `imports/dbup-sqlserver`) does not remain.

3. **Later upstream fixes come in as diffs, not as `git subtree pull`.** `upstream/manifest.json` records, for each provider, the URL, the full commit SHA that was imported and the destination paths. To take a later fix, compare the upstream repository from the manifest SHA to the new upstream commit, map the paths onto `src/<Provider>` and `tests/<Provider>`, apply the change as a normal commit, and update the SHA in the manifest.

4. **The core moves to `src/Core` and `tests/Core`.** The current `src/dbup-core` becomes `src/Core`, and `src/dbup-tests` becomes `tests/Core`. The shared test helpers (`src/Tests.Common`) are placed where the later build ticket decides. The spec allows project names and nesting to follow the imported repositories.

5. **Package IDs follow the existing `dbbump-core` pattern:** `dbbump-sqlserver`, `dbbump-postgresql`, `dbbump-mysql`, `dbbump-sqlite`, `dbbump-oracle`, `dbbump-firebird`, `dbbump-redshift` and `dbbump-clickhouse`. All are unpublished on nuget.org as of the inventory date.

6. **Namespaces stay `DbUp.*` for this migration.** No namespace, assembly or public API rename happens as part of the consolidation. The spec lists branding in stages (package IDs, assembly names, namespaces, public API) and puts them after the consolidated solution passes its baseline tests.

## Trade-off: history now, easy sync later

Flattening after a subtree import keeps the full upstream history but gives up `git subtree pull`.

- `git subtree pull --prefix=<dir>` needs the prefix directory to exist and to hold the upstream tree. Once the files are under `src/<Provider>` and `tests/<Provider>`, with repository-level files deleted, no single prefix matches. A pull would try to merge upstream changes into paths that no longer exist, and the result would be conflicts and re-added files.
- A diff from the manifest SHA works regardless of layout, but it is manual. Someone must map paths, resolve conflicts and update the manifest. Nothing records which upstream commits have been applied except the manifest SHA and the commit messages.
- Upstream commits will not appear as parents of the sync commits, so `git log` shows an applied fix as a new commit. Commit messages for sync commits should name the upstream commit range so attribution is not lost.
- The imported history still follows files across the move, because `git mv` records renames and `git log --follow` and `git blame` work on the flattened paths.
- The manifest becomes the only link between the monorepo and upstream. It must be kept correct, and it must hold full 40-character SHAs, not branch names.

The alternative in the spec, keeping stable import directories, would keep `git subtree pull` but leave eight extra directory trees beside the core, duplicate configuration, and a layout that does not match section 3. The project chose the cleaner layout and accepts the manual sync cost. The spec itself puts automatic upstream synchronisation out of scope.

## Consequences

- Phase 2 must record the imported SHAs in `upstream/manifest.json` and verify that each provider's history is reachable before flattening.
- A documented process for taking upstream fixes is required (spec section 14, item 14). It describes the diff-from-manifest-SHA procedure above and does not mention `git subtree pull`.
- Upstream licence files (`license.txt`, `Npgsql-LICENSE`) and copyright notices are kept. The MIT licence and "DbUp contributors" attribution stay intact.
- Provider build, CI and versioning files that the flattened layout makes obsolete are listed in the inventory and are removed in Phase 2.
- The `dbbump-*` IDs are checked again just before the first publish, because a nuget.org lookup cannot show prefix reservations.
- Because namespaces stay `DbUp.*` while package IDs change, consumers add `dbbump-*` packages but keep their existing `using DbUp...` lines. A project that references both `dbup-*` and `dbbump-*` packages gets duplicate types and must use one family only.
