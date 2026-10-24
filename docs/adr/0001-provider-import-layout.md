# 1. Import the providers with history, then flatten them into `src/<Provider>`

**Status:** Accepted
**Date:** 2026-10-24
**Spec:** [`docs/specs/001-migrate-monorepo.md`](../specs/001-migrate-monorepo.md): section 2 (repositories to import), 3 (repository structure), 4.1 (import requirements), 4.2 (import manifest), 11 (branding and compatibility) and 13 (implementation phases)
**Facts:** [`docs/inventory/001-baseline.md`](../inventory/001-baseline.md). The provider list, upstream URLs and SHAs, package ID availability and the other measured facts are kept there and not repeated here.

## Context

The fork holds only the core. The eight database providers live in separate upstream repositories, listed in inventory section 3. The spec asks for one repository that builds, tests and releases all of them at one version.

Section 4.1 of the spec offers two layouts and asks for the choice to be written down before the migration finishes. The first keeps each import in a stable directory, so `git subtree pull` keeps working. The second moves the files into the monorepo layout, which gives a cleaner tree but makes later subtree pulls hard. The spec also says history preservation and easy upstream sync are separate goals. This record states which was chosen and what it costs.

## Decision

1. **Import with `git subtree add`, full history, no `--squash`.** Each provider is added from its official GitHub URL at the commit recorded in inventory section 3, on a dedicated integration branch. Upstream commits, authors and dates stay in the log. Submodules are not used.

2. **Then flatten.** After the import is verified, the provider's library moves with `git mv` to `src/<Provider>` and its tests to `tests/<Provider>`, where `<Provider>` is the directory name in inventory section 3.5. The temporary import directory (for example `imports/dbup-sqlserver`) does not remain.

3. **Later upstream fixes come in as diffs, not as `git subtree pull`.** `upstream/manifest.json` (spec section 4.2) records, for each provider, the URL, the full commit SHA that was imported and the destination paths. To take a later fix, compare the upstream repository from the manifest SHA to the new upstream commit, map the paths onto `src/<Provider>` and `tests/<Provider>`, apply the change as a normal commit, and update the SHA in the manifest.

4. **The core moves to `src/Core` and `tests/Core`.** The current `src/dbup-core` becomes `src/Core`, and `src/dbup-tests` becomes `tests/Core`. The shared test helpers (`src/Tests.Common`) are placed where the later build ticket decides. The spec allows project names and nesting to follow the imported repositories.

   This departs from the preference in spec section 3 to integrate with the existing core "over unnecessarily moving files". It is justified because the target tree in section 3 itself shows `src/Core` and `tests/Core`, so the spec names the destination. Without the move, the core would stay in `src/dbup-core` and `src/dbup-tests` beside eight providers in `src/<Provider>`, which gives two naming schemes in one tree and a core path that differs from section 3. Only the two project directories move. The projects, namespaces and the folders inside them keep their current structure, and the move is done as a rename-only commit (see the trade-off below).

5. **Package IDs follow the existing `dbbump-core` pattern:** `dbbump-<provider>`, with the provider name in lower case. Inventory section 5.1 records which IDs are free on nuget.org.

6. **Namespaces stay `DbUp.*` for this migration.** No namespace, assembly or public API rename happens as part of the consolidation. Spec section 11 lists branding in stages (package IDs, assembly names, namespaces, public API) and puts them after the consolidated solution passes its baseline tests.

## Trade-off: history now, easy sync later

Flattening after a subtree import keeps the full upstream history but gives up `git subtree pull`.

- `git subtree pull --prefix=<dir>` needs the prefix directory to exist and to hold the upstream tree. Once the files are under `src/<Provider>` and `tests/<Provider>`, with repository-level files deleted, no single prefix matches. A pull would try to merge upstream changes into paths that no longer exist, and the result would be conflicts and re-added files.
- A diff from the manifest SHA works regardless of layout, but it is manual. Someone must map paths, resolve conflicts and update the manifest. Nothing records which upstream commits have been applied except the manifest SHA and the commit messages.
- Upstream commits will not appear as parents of the sync commits, so `git log` shows an applied fix as a new commit. Commit messages for sync commits should name the upstream commit range so attribution is not lost.
- Git does not store renames. It detects them when asked, by comparing file content, as `git log --follow` and `git blame` do. History therefore normally follows a file across the move, but detection can fail for small files or for files whose content also changed in the move commit. The move commits should change paths only, and the history check before flattening (see Consequences) should include a `git log --follow` spot check on files in each provider.
- The manifest becomes the only link between the monorepo and upstream. It must be kept correct, and it must hold full 40-character SHAs, not branch names.

Spec section 4.1 names stable import directories as an acceptable alternative. They would keep `git subtree pull` working, at the cost of eight extra directory trees beside the core and repository-level configuration repeated in each. The flattened layout was preferred because it gives the single `src/<Provider>` and `tests/<Provider>` tree of spec section 3 and one set of build configuration, and the project accepts the manual sync cost. The spec itself puts automatic upstream synchronisation out of scope.

## Consequences

- Phase 2 records the imported SHAs in `upstream/manifest.json` and verifies that each provider's history is reachable before flattening (spec section 13).
- A documented process for taking upstream fixes is required (spec section 14, item 14). It describes the diff-from-manifest-SHA procedure above and does not mention `git subtree pull`.
- Upstream licence files and copyright notices are kept (inventory section 3.1). The MIT licence and "DbUp contributors" attribution stay intact.
- Provider build, CI and versioning files that the flattened layout makes obsolete are listed in inventory section 3.4 and are removed in Phase 2.
- The `dbbump-*` IDs are checked again just before the first publish, because a nuget.org lookup cannot show prefix reservations.
- Because namespaces stay `DbUp.*` while package IDs change, consumers add `dbbump-*` packages but keep their existing `using DbUp...` lines. A project that references both `dbup-*` and `dbbump-*` packages gets duplicate types and must use one family only.
