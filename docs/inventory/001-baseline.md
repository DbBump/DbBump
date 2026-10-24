# Baseline inventory for the monorepo consolidation

**Spec:** [`docs/specs/001-migrate-monorepo.md`](../specs/001-migrate-monorepo.md), Phase 1
**Ticket:** DbBump/DbBump#7
**Captured:** 2026-10-24
**Decisions:** [ADR 0001](../adr/0001-provider-import-layout.md)

This document is the baseline that later tickets measure against. It is the single home for measured facts. Decisions are in the ADR, and section 6 lists open points. Nothing in the repository was changed to produce it. Upstream facts come from the GitHub API, shallow clones of each provider at the SHA shown, and the NuGet v3 API. Every upstream SHA is the full 40 characters.

## 1. The fork today

| Item | Value |
|---|---|
| Repository | `DbBump/DbBump` (fork of `DbUp/DbUp`) |
| Branch inspected | `main` and `spec-001/baseline-inventory`, which point at the same commit |
| Commit | `4848e65a25ecdd0191481699210b56bd7cbb75c9` (2026-10-24, "Merge pull request #31 from DbBump/docs/spec-001-monorepo") |
| Working tree | Measured on commit `4848e65` in a fresh clone or worktree: clean, with no tracked changes and no untracked files. The shared developer checkout is not clean (see below). |
| Commits in history | 1075 |
| `global.json` | None. The SDK is whatever is newest on the machine. |
| Solution | `src/DbUp.sln` (classic `.sln`, three projects) |

### 1.1 Projects

| Project | Path | Kind | Target framework | Assembly name | Package ID |
|---|---|---|---|---|---|
| Core | `src/dbup-core/dbup-core.csproj` | library, packable | `netstandard2.0` | `dbbump-core` | `dbbump-core` |
| Core tests | `src/dbup-tests/dbup-tests.csproj` | xUnit test project | `net10.0` | `dbup-tests` | none |
| Test helpers | `src/Tests.Common/Tests.Common.csproj` | library, shared by test projects | `net10.0` | `DbBump.Tests.Common` | `DbBump.Tests.Common` (see below) |

There are no sample projects and no other source projects.

The shared developer checkout at `D:\Data\_CodeOS\Dbup` also has local-only items that a fresh clone or worktree does not: an untracked `.claude/` directory (agent worktrees) and the leftover build-output directories in section 1.4.

Core details:

- Root namespace is `DbUp`. Namespaces in the core are `DbUp`, `DbUp.Builder`, `DbUp.Engine`, `DbUp.Engine.*`, `DbUp.Helpers`, `DbUp.ScriptProviders`, `DbUp.Support`.
- External package: `Microsoft.Extensions.Logging.Abstractions` 8.0.0. No other runtime dependency.
- Signed with `src/dbup.snk`.
- 74 `.cs` files in the core, 34 in the core tests.
- Core test packages: `Microsoft.NET.Test.Sdk` 18.0.0, `xunit` 2.9.3, `xunit.runner.visualstudio` 3.1.5, `NSubstitute` 5.3.0, `Serilog` 4.3.0, `Serilog.Extensions.Logging` 9.0.2, `Serilog.Sinks.Console` 6.1.1, `Serilog.Sinks.InMemory` 2.0.0.
- `Tests.Common` packages: `Assent` 3.0.1, `PublicApiGenerator` 11.4.5, `TestStack.BDDfy.Xunit` 2.0.1, `Shouldly` 4.3.0. Its namespace is `DbUp.Tests.Common` and it holds `DatabaseSupportTestsBase`, `NoPublicApiChangesBase`, `TestConnectionManager` and the `RecordingDb` fakes. The upstream provider tests use these same type names.
- `src/Directory.Build.props` sets `TreatWarningsAsErrors=true`, `LangVersion=latest`, MIT licence, the `DbBump Contributors` author and the `dbbump-icon.png` package icon. `src/Directory.Build.targets` adds the README, icon and `Microsoft.SourceLink.GitHub` 10.0.402 to packable projects.

### 1.2 Packages the fork produces

`dotnet pack src/DbUp.sln -c Release` produces two packages:

| Package | Version when packed locally | Note |
|---|---|---|
| `dbbump-core` | 1.0.0 | Expected. Contains `lib/netstandard2.0/dbbump-core.dll`, XML docs, README and icon. Single dependency: `Microsoft.Extensions.Logging.Abstractions` 8.0.0. |
| `DbBump.Tests.Common` | 1.0.0 | Not intended. `Tests.Common` does not set `IsPackable=false`, so it packs. The release workflow only attaches `dbbump-core.*.nupkg`, so it is never published, but the CI "Packages" artifact contains it. |

The version is 1.0.0 because nothing passes `/p:Version` locally. CI passes the GitVersion result.

### 1.3 Build, release and CI files in the fork

| File | What it does |
|---|---|
| `.github/workflows/main.yml` | CI on `windows-latest`. GitVersion 5.x, restore, build, test, pack, upload artifacts. Uses `dotnet-version: 10.0.x`. |
| `.github/workflows/create-release.yml` | Manual. Builds and creates a draft GitHub release with only `dbbump-core.*.nupkg`. |
| `.github/workflows/publish-release.yml` | On release published, downloads the release assets and runs `dotnet nuget push *.nupkg --skip-duplicate`. The spec (6.3) forbids silently skipping duplicates, so the two conflict. |
| `.github/workflows/test-report.yml` | Publishes test reports after CI or Create Release. |
| `.github/workflows/docs.yml` | Builds and deploys `docs-website/` to GitHub Pages. |
| `.github/dependabot.yml` | Weekly NuGet updates for `/`. |
| `GitVersion.yml` | Root file. Mainline mode, ignores two SHAs and commits before 2024-01-01. |
| `src/dbup.snk` | Strong-name key. |
| `src/dbup.1.2.3.nupkg` | Tracked binary. See section 6. |

### 1.4 Leftovers in the fork

Recorded as found, not changed.

Tracked in Git:

- `src/dbup.1.2.3.nupkg` (7620 bytes, added in commit `a0b841f`). It is the obsolete `dbup` shim package from `dbup-sqlserver`: ID `dbup`, version 1.2.3, one dependency on `dbup-sqlserver` 1.2.3, authors "Paul Stovell, Jim Burger, Jake Ginnivan, Damian Maclennan", repository `DbUp/DbUp`. It is not referenced by any project.
- `src/dbup.snk` (see section 5.5).
- `src/.idea/` and `src/DbUp.sln.DotSettings` (Rider settings).

Present in the shared checkout at `D:\Data\_CodeOS\Dbup\src` but not tracked and not in a fresh clone or worktree. All three contain only build output, which `.gitignore` hides (`bin/`, `obj`), so `git status` does not list them:

| Directory | Files | What is in it |
|---|---|---|
| `src/dbup-redshift` | 19 | `bin/Debug` and `obj/Debug` for `net35`, `net45`, `netstandard1.3`, `netstandard2.0`. No source. Left from the days when Redshift lived in the core repo (the Changelog says it moved out). |
| `src/dbup-sqlite-mono` | 67 | `bin` and `obj` for `net40`, `net45`, `net462`, nuspecs for versions `5.0.35-*` and `5.12.0-alpha.*`, and a copied `dbup-core.dll`. No source. |
| `src/dbup-tests-sqlite` | 9 | `obj` for `netcoreapp2.0` and an empty `ApprovalFiles` directory. No source. |

Also untracked and ignored: `src/.vs`. None of these directories contain source, so they do not affect any provider import, but they sit beside the paths the migration will use.

## 2. Baseline: core build and test

Commands, run from a fresh worktree of `4848e65` with no `bin` or `obj`:

```text
dotnet build src/DbUp.sln
dotnet test  src/DbUp.sln --no-build
```

| SDK | Configuration | Build | Warnings | Errors |
|---|---|---|---|---|
| `11.0.100-rc.2.26504.105` (the default on this machine, because there is no `global.json`) | Debug | succeeded | 0 | 0 |
| `11.0.100-rc.2.26504.105` | Release | succeeded | 0 | 0 |
| `10.0.402` (selected with a temporary `global.json`, removed afterwards) | Debug | succeeded | 0 | 0 |

The SDK 11 build prints message `NETSDK1057` (preview SDK). It is not a warning.

| Test project | Framework | Passed | Failed | Skipped | Total |
|---|---|---|---|---|---|
| `dbup-tests` | `net10.0` | 100 | 0 | 0 | 100 |
| `Tests.Common` | n/a | not a test project | | | |

The same counts (100/0/0) came out on SDK 11 Debug, SDK 11 Release and SDK 10.0.402 Debug. The run took under one second. CI pins `10.0.x`, so SDK 10.0.402 is the closest match to CI.

## 3. Upstream providers

All eight repositories are under the `DbUp` organisation, are public, not archived, use `main` as the default branch, and use the MIT licence.

Commit counts are the number of commits on `main`. "Release tag" is the latest GitHub release.

| Provider | Official URL | Default branch | Commit to import (full SHA) | Commit date | Commits | Latest release |
|---|---|---|---|---|---|---|
| SqlServer | https://github.com/DbUp/dbup-sqlserver | `main` | `74294314abb4d4199e108c0172838eaab57e5595` | 2026-02-24 | 43 | `7.2.0` (same commit) |
| PostgreSql | https://github.com/DbUp/dbup-postgresql | `main` | `5aa672ea59c0c32a36355db5308eea1e374446b2` | 2026-02-23 | 37 | `7.0.1` (same commit) |
| MySql | https://github.com/DbUp/dbup-mysql | `main` | `39e3871ac96f1559316ecef2b8f40447705aa5ec` | 2025-11-06 | 38 | `6.1.0` (same commit) |
| Sqlite | https://github.com/DbUp/dbup-sqlite | `main` | `9533fde07f9208302acd62d63325fc1545be2888` | 2025-11-06 | 25 | `6.0.4` (same commit) |
| Oracle | https://github.com/DbUp/dbup-oracle | `main` | `27d07dc7195fb816864e9becb701419ec27a775e` | 2026-02-23 | 27 | `6.2.0` (same commit) |
| Firebird | https://github.com/DbUp/dbup-firebird | `main` | `fb3a03f3f7387f56bd371953dcd57541b7a93bc2` | 2026-02-23 | 28 | `6.1.0` (same commit) |
| Redshift | https://github.com/DbUp/dbup-redshift | `main` | `ad586d3b71145b6baa6484ba80e4e8f0ece2bfa2` | 2025-11-06 | 37 | `6.0.3` is `2559a7d8d83ad7efce32cb6751df3bbf4cd7f86a`; `main` is one commit later (README badge fix only) |
| ClickHouse | https://github.com/DbUp/dbup-clickhouse | `main` | `705cd0bda526c8d28fef80c6677f3b7c4ba9e3bc` | 2026-02-23 | 27 | `2.0.0` (same commit) |

For reference, `DbUp/DbUp` (the original core) has default branch `main`, head `41228ce747979fb52e1a59e3eec5823e6de869c8` (2026-02-18). The fork's relationship to that commit is not part of this ticket.

The SHAs were read twice: from the commits API and from `git rev-parse` in the shallow clones. They agreed for all eight. They are the revisions to import. They are the heads of `main` on the capture date, and `main` can move after it.

### 3.1 Licence and copyright

All eight `license.txt` files are byte-identical (SHA-256 prefix `a95b48f348fd`): MIT, first line "Copyright (C) 2015 DbUp contributors." Every csproj carries `Copyright © DbUp Contributors 2015` except Redshift, which has none. The fork's root `license.txt` has the same text, wrapped differently, with no DbBump line. The fork's `dbbump-core` csproj says "Copyright © DbUp Contributors 2015, DbBump Contributors 2026".

The PostgreSql repo also ships `src/dbup-postgresql/Npgsql-LICENSE`, a third-party licence file.

### 3.2 Layout, target frameworks and dependencies

Each repository has the same shape: `src/dbup-<name>/` (library), `src/Tests/` (tests), optional `src/Sample/`, plus repo-level files. Source file counts (`.cs`, including tests and samples): SqlServer 20, PostgreSql 16, MySql 14, Sqlite 16, Oracle 14, Firebird 11, Redshift 10, ClickHouse 14.

| Provider | Library TFM | `dbup-core` NuGet version | ADO.NET client package | Other runtime packages | Assembly / package ID today | Root namespace |
|---|---|---|---|---|---|---|
| SqlServer | `netstandard2.0` | 6.1.1 | `Microsoft.Data.SqlClient` 6.1.4 | none | `dbup-sqlserver` | `DbUp.SqlServer` |
| PostgreSql | `netstandard2.0`, `net8.0` | 6.1.1 | `Npgsql` 8.0.7 (netstandard2.0), `Npgsql` 10.0.1 (net8.0) | none | `dbup-postgresql` | `DbUp.Postgresql` |
| MySql | `netstandard2.0` | 6.0.15 | `MySqlConnector` 2.3.5 | none | `dbup-mysql` | `DbUp.MySql` |
| Sqlite | `netstandard2.0` | 6.0.15 | `Microsoft.Data.Sqlite.Core` 9.0.10 | none | `dbup-sqlite` | `DbUp.Sqlite` |
| Oracle | `netstandard2.1` | 6.1.1 | `Oracle.ManagedDataAccess.Core` 23.26.100 | none | `dbup-oracle` | `DbUp.Oracle` |
| Firebird | `netstandard2.0` | 6.1.1 | `FirebirdSql.Data.FirebirdClient` 10.3.4 | none | `dbup-firebird` | `DbUp.Firebird` |
| Redshift | `net8.0` | 6.0.15 | `Npgsql` 9.0.4 | none | `dbup-redshift` | `DbUp.Redshift` |
| ClickHouse | `net8` (alias for `net8.0`) | 6.1.1 | `ClickHouse.Driver` 1.0.0 | none | `dbup-clickhouse` | `DbUp.ClickHouse` |

Notes:

- Every library project has exactly two kinds of `PackageReference`: `dbup-core` and the ADO.NET client package, as in the table. None has any other runtime package, and none of the providers' `Directory.Build.props` files adds one. For PostgreSql the client package version depends on the target framework, as the table shows. The sample projects are in section 3.4.
- The providers were built against `dbup-core` 6.0.15 or 6.1.1 from NuGet. The fork's core has been changed since (rebranding, assembly name `dbbump-core`). Whether each provider compiles and passes against the fork's core is not yet known.
- Redshift and ClickHouse target only `net8.0`, so they cannot be used from .NET Framework or older .NET projects. Oracle targets `netstandard2.1`, which also rules out .NET Framework. The other five (SqlServer, PostgreSql, MySql, Sqlite, Firebird) target `netstandard2.0`, as does the fork's core. The spec says to keep existing target frameworks during the migration, so these differences stay.
- Every library sets `GenerateDocumentationFile`, `SignAssembly` (except ClickHouse), and a `CI`-conditional block for deterministic builds and embedded debug symbols.

### 3.3 Test projects and infrastructure

Every provider has one test project at `src/Tests/Tests.csproj`, all with assembly name `Tests`, target framework `net8`, `ImplicitUsings` and `Nullable` enabled. All reference `DbUp.Tests.Common` as a NuGet package at 6.1.1 or 6.0.15, plus `Microsoft.NET.Test.Sdk` (18.0.0 or 18.0.1), `xunit` 2.9.3 and `xunit.runner.visualstudio` 3.1.5.

| Provider | Test files (excluding approval file) | Infrastructure needed | Extra test packages |
|---|---|---|---|
| SqlServer | `DatabaseSupportTests`, `MicrosoftDataSqlClientVersionTests`, `NoPublicApiChanges`, `SqlCommandSplitterTests`, `SqlObjectParserTests`, `SqlParserTests`, `SqlScriptExecutorTests` | None. Uses the recording fake database. | `NSubstitute` 5.3.0 |
| PostgreSql | `DatabaseSupportTests`, `NoPublicApiChanges`, `PostgresTableJournalTests`, `PostgresqlQueryParserTests`, `AssemblyInfo` | None. Uses the recording fake. Disables test parallelisation because Npgsql uses global switches. | `NSubstitute` 5.3.0 |
| MySql | `DatabaseSupportTests`, `MySqlConnectionManagerTests`, `MySqlSupportTests`, `NoPublicApiChanges` | None. Uses the recording fake. | none |
| Sqlite | `DatabaseSupportTests`, `NoPublicApiChanges`, `SqliteSupportTests`, `SqliteTableJournalTests` | A local SQLite file and an in-memory database. No server. | `NSubstitute` 5.3.0, `Microsoft.Data.Sqlite` 9.0.10 |
| Oracle | `DatabaseSupportTests`, `NoPublicApiChanges`, `OracleConnectionManagerTests` | None. | none |
| Firebird | `DatabaseSupportTests`, `NoPublicApiChanges` | None for the tests. The sample needs a Firebird container (`jacobalberty/firebird`, via `src/Sample/docker-compose.yml`). | none |
| Redshift | `DatabaseSupportTests`, `NoPublicApiChanges` | None. No test talks to Redshift or PostgreSQL. | none |
| ClickHouse | `ClickHouseContainerFixture`, `ClickHouseIntegrationTests`, `ClickHouseJournalTests`, `ClickHouseQueryParserTests`, `DatabaseSupportTests`, `NoPublicApiChanges` | Docker. `Testcontainers.ClickHouse` 4.10.0 starts `clickhouse/clickhouse-server:latest` (not pinned). | `Testcontainers.ClickHouse` 4.10.0, `NSubstitute` 5.3.0 |

The infrastructure column comes from reading the test sources and csproj files and searching them for connection strings, environment variables and container use. The upstream tests were not run for this ticket. Test counts per provider were not measured.

Findings that affect later phases:

- Only ClickHouse has tests against a real database engine. The spec's integration matrix (section 8) therefore covers seven providers that have no real-database tests today.
- Every test project is named `Tests` and builds `Tests.dll`. Eight projects cannot share one project name and assembly name in one solution. `Tests` is also the directory name in each provider today, where the destination is `tests/<Provider>` (section 3.5).
- Every provider has a `NoPublicApiChanges` test with an approval file, and these compare against the public API of that provider's assembly. Any rename of the assembly or namespace will show up as a failing approval test.
- The test projects restore `DbUp.Tests.Common` 6.x from a package feed. nuget.org only has `dbup.tests.common` 5.0.37, so the 6.x package comes from a feed other than nuget.org. The ClickHouse `.gitlab-ci.yml` (section 3.4) names `https://nuget.pkg.github.com/DbUp/index.json`. The fork's own `Tests.Common` project replaces it as a project reference. It keeps the namespace `DbUp.Tests.Common` and the same type names, but its assembly is `DbBump.Tests.Common`.
- SqlServer has a test that asserts `Microsoft.Data.SqlClient` is a 6.1.x build. A central package version that moves it would fail the test. The same test file has a check that fails after 2028-08-14.
- The provider test projects use `Shouldly` without referencing it. It arrives through `DbUp.Tests.Common`. The fork's `Tests.Common` also references `Shouldly` 4.3.0.

### 3.4 Standalone build, CI and versioning files that become obsolete

Present in every provider unless noted. Spec section 4.1 (step 6) removes obsolete standalone CI and release configuration after import; these are the files that apply.

| File | Why it is obsolete |
|---|---|
| `.github/workflows/main.yml`, `publish-release.yml`, `test-report.yml` | One-line callers of reusable workflows in `DbUp/Universe/.github/workflows/*@main`. The real build logic is in an external repository, so it is not in the provider and cannot be imported. |
| `.github/dependabot.yml` | Per-repo; replaced by the root file. |
| `.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md` | Per-repo templates. |
| `GitVersion.yml` | `mode: Mainline`. SqlServer also ignores commits before 2024-11-06. Replaced by the root `GitVersion.yml`. |
| `src/Directory.Build.props` | Sets authors, project URL, licence, `TreatWarningsAsErrors` and `LangVersion`. Its `RepositoryUrl` is wrong in seven providers (`https://github.com/dbup-<name>/dbup-<name>.git`), but each csproj sets the correct value and wins. ClickHouse is correct in both. |
| `src/dbup-<name>.sln` and `.sln.DotSettings` | Replaced by the root solution. |
| `src/.editorconfig` | Seven providers have an identical file. The eighth and the fork's own differ from it. |
| `src/dbup.snk` | The same key as the fork's (section 5.5). |
| `src/dbup-icon.png` | Same image in all eight (SHA-256 prefix `9e00fc36`). The fork uses `dbbump-icon.png`. |
| `.gitattributes`, `.gitignore` | Per-repo. |

Extra files:

- SqlServer: `src/dbup/dbup.nuspec` and `src/dbup/Shim.txt`, the source of the obsolete `dbup` shim package.
- ClickHouse: `.gitlab-ci.yml` (builds on a private GitLab with a `nuget.rapidsoft.ru` feed and a GitHub Packages feed using a personal token) and `start-clickhouse.ps1` (starts `clickhouse/clickhouse-server:23.6-alpine`; a different version from the one the tests use).
- Firebird: `src/Sample/` with `docker-compose.yml`, `appsettings.json` and `README.md`.
- Sample projects exist in SqlServer, Sqlite and Firebird only, at `src/Sample/Sample.csproj`. All set `IsPackable=false`. Each references its provider library by project reference. Namespaces are `SampleApplication`, `SqliteSampleApplication` and `FirebirdSampleApplication`.

  | Provider | Target framework | Packages |
  |---|---|---|
  | SqlServer | `net7.0` | none |
  | Sqlite | `net8` | `Microsoft.Data.Sqlite` 9.0.0 |
  | Firebird | `net8.0` | `Microsoft.Extensions.Configuration.Json` 9.0.0 |
- MySql: `src/Tests/MySqlSupportTests.CanHandleDelimiter.approved.txt`, a test data file used by the MySql tests.
- Each `README.md` has shields pointing at the old repository and NuGet package.

### 3.5 Destination directories

Spec section 2.1 asks for each repository's URL, branch or tag, commit SHA, import date, original licence and destination directory. The URL, branch, SHA and latest release tag are in the table at the start of section 3, and the licence is in section 3.1. The import date does not exist yet, because nothing has been imported. The destination directories are set by [ADR 0001](../adr/0001-provider-import-layout.md) and are in this table, next to the project paths in each upstream repository today.

| Provider | Library project today | Test project today | Library destination | Tests destination |
|---|---|---|---|---|
| SqlServer | `src/dbup-sqlserver/dbup-sqlserver.csproj` | `src/Tests/Tests.csproj` | `src/SqlServer` | `tests/SqlServer` |
| PostgreSql | `src/dbup-postgresql/dbup-postgresql.csproj` | `src/Tests/Tests.csproj` | `src/PostgreSql` | `tests/PostgreSql` |
| MySql | `src/dbup-mysql/dbup-mysql.csproj` | `src/Tests/Tests.csproj` | `src/MySql` | `tests/MySql` |
| Sqlite | `src/dbup-sqlite/dbup-sqlite.csproj` | `src/Tests/Tests.csproj` | `src/Sqlite` | `tests/Sqlite` |
| Oracle | `src/dbup-oracle/dbup-oracle.csproj` | `src/Tests/Tests.csproj` | `src/Oracle` | `tests/Oracle` |
| Firebird | `src/dbup-firebird/dbup-firebird.csproj` | `src/Tests/Tests.csproj` | `src/Firebird` | `tests/Firebird` |
| Redshift | `src/dbup-redshift/dbup-redshift.csproj` | `src/Tests/Tests.csproj` | `src/Redshift` | `tests/Redshift` |
| ClickHouse | `src/dbup-clickhouse/dbup-clickhouse.csproj` | `src/Tests/Tests.csproj` | `src/ClickHouse` | `tests/ClickHouse` |

The core moves in the same way: `src/dbup-core` to `src/Core` and `src/dbup-tests` to `tests/Core`. Spec section 3 shows a top-level `samples/` directory. It does not say where the three sample projects in section 3.4 go.

## 4. Provider-to-provider dependencies

None of the eight packages depends on another provider's package, and no source file uses another provider's namespace.

**Redshift does not depend on PostgreSql.** `dbup-redshift` references `Npgsql` 9.0.4 directly and builds its own `RedshiftConnectionManager` and `RedshiftExtensions` on `NpgsqlConnection` and `NpgsqlConnectionStringBuilder`. It has no reference to `dbup-postgresql` or to `DbUp.Postgresql`. This means Redshift can be imported and packed with only the core as an internal dependency. `Npgsql` appears at three versions across two providers (8.0.7, 10.0.1, 9.0.4); see section 5.3.

Every provider depends on the core, and every test project depends on `Tests.Common`. The dependency graph is therefore a star around the core.

## 5. Conflicts

### 5.1 NuGet package IDs on nuget.org

Checked on 2026-10-24 with `https://api.nuget.org/v3-flatcontainer/<lowercase-id>/index.json`. A 404 means the ID has no published package. The check cannot see an ID prefix reservation, so a final check in the NuGet.org portal is still needed before the first push.

| Planned ID | Result |
|---|---|
| `dbbump-core` | free (404) |
| `dbbump-sqlserver` | free (404) |
| `dbbump-postgresql` | free (404) |
| `dbbump-mysql` | free (404) |
| `dbbump-sqlite` | free (404) |
| `dbbump-oracle` | free (404) |
| `dbbump-firebird` | free (404) |
| `dbbump-redshift` | free (404) |
| `dbbump-clickhouse` | free (404) |
| `dbbump` (not planned, checked for completeness) | free (404) |
| `dbbump.tests.common` (the `Tests.Common` project is already packable under this ID) | free (404) |

The IDs the providers publish under today are all taken by the DbUp project, which is the reason for the rename:

| Existing ID | Versions on nuget.org | Latest |
|---|---|---|
| `dbup-core` | 32 | 6.1.1 |
| `dbup-sqlserver` | 26 | 7.2.0 |
| `dbup-postgresql` | 37 | 7.0.1 |
| `dbup-mysql` | 32 | 6.1.0 |
| `dbup-sqlite` | 32 | 6.0.4 |
| `dbup-oracle` | 16 | 6.2.0 |
| `dbup-firebird` | 32 | 6.1.0 |
| `dbup-redshift` | 10 | 6.0.3 |
| `dbup-clickhouse` | 2 | 2.0.0 |
| `dbup` (shim) | 46 | 5.0.41 |
| `dbup.tests.common` | 1 | 5.0.37 |

### 5.2 Assembly and project name conflicts

- Eight test projects each named `Tests`, each building `Tests.dll`. This is the only conflict that blocks a single solution outright.
- The fork's `Tests.Common` assembly is `DbBump.Tests.Common`; the providers expect the package `DbUp.Tests.Common`. The namespace is the same, so provider test code compiles unchanged once the project reference is in place.
- The fork's core assembly is `dbbump-core`. Provider code compiled against `dbup-core` binds by assembly name, so a provider built against `dbup-core` does not bind to `dbbump-core` without a rebuild. A consumer who ends up with both `dbup-core` and `dbbump-core` loaded gets two copies of every `DbUp.*` type.
- Strong-name identity: all providers and the core are signed with the same key. ClickHouse is unsigned, which is allowed (an unsigned assembly may reference a signed one) but means it has no strong name.

### 5.3 Package version conflicts for central package management

| Package | Versions in use |
|---|---|
| `Npgsql` | 8.0.7 (PostgreSql, netstandard2.0), 10.0.1 (PostgreSql, net8.0), 9.0.4 (Redshift) |
| `Microsoft.NET.Test.Sdk` | 18.0.0 (core tests, MySql, Sqlite, Redshift), 18.0.1 (SqlServer, PostgreSql, Oracle, Firebird, ClickHouse) |
| `Microsoft.Data.Sqlite` | 9.0.10 (Sqlite tests), 9.0.0 (Sqlite sample) |
| `dbup-core` | 6.0.15 or 6.1.1 (replaced by a project reference) |
| `DbUp.Tests.Common` | 6.0.15 or 6.1.1 (replaced by a project reference) |

All other shared packages (`xunit` 2.9.3, `xunit.runner.visualstudio` 3.1.5, `NSubstitute` 5.3.0) already agree. Target frameworks also differ: the fork's tests are `net10.0`, the providers' tests are `net8`.

### 5.4 Namespace conflicts

No two assemblies define the same namespace-and-type pair. No provider file shares a name with a core file other than `AssemblyInfo.cs`, which is per-assembly and does not collide. Differences to note:

- Casing: the namespace is `DbUp.Postgresql` and `DbUp.MySql`, while the planned directory is `PostgreSql` and the spec writes "PostgreSql". The ID `dbbump-postgresql` is lower case, so the three spellings do not clash. The migration does not change namespaces (ADR 0001).
- Test namespaces are inconsistent. Most providers use `DbUp.<Provider>.Tests`. Oracle uses `DbUp.Tests.Providers.Oracle` and `DbUp.Tests.Support.Oracle`. Firebird uses `DbUp.Tests.Providers.Firebird`. The core tests use `DbUp.Tests` and sub-namespaces, so Oracle and Firebird tests sit inside the core test namespace tree. No type clashes today.
- Every provider test class `NoPublicApiChanges` and `DatabaseSupportTests` has the same simple name, which is fine because the namespaces differ, but it matters if tests are ever merged into one project.
- Sample namespaces (`SampleApplication`, `SqliteSampleApplication`, `FirebirdSampleApplication`) are outside `DbUp.*`.
- The fork's `Directory.Build.props` sets `TreatWarningsAsErrors=true` and each provider's does too. Providers have only ever been built with their own settings, so whether warnings from the newer core and SDK appear under these settings is unknown until they are built together.

### 5.5 Strong-name keys

The same `dbup.snk` (SHA-256 prefix `b65296a5276c725d`, 596 bytes) is in the fork and in all eight providers. Seven providers sign with it. ClickHouse has the file but does not set `SignAssembly`. Firebird sets `PublicSign` on non-Windows, so it is public-signed there. Because the key is identical, one root copy could serve all of them. Seven provider projects set `AssemblyOriginatorKeyFile` to `../dbup.snk`, relative to the library project directory.

## 6. Open points for later tickets

These are observations and questions, not decisions. Where the facts are already in this document, the item points to them.

1. Untracked build-output directories in the shared checkout: section 1.4.
2. Whether to delete the tracked `src/dbup.1.2.3.nupkg`: section 1.4 (cleanup phase).
3. `Tests.Common` is packable by accident: section 1.2. Set `IsPackable=false` when the central build properties arrive (Phase 3), or decide to publish it.
4. `publish-release.yml` uses `--skip-duplicate`: section 1.3 (spec 6.3, Phase 6).
5. Add a `global.json` (Phase 3). The baseline ran on a preview SDK: section 2.
6. ClickHouse tests use an unpinned `:latest` container image: section 3.3 (spec 8.1).
7. Upstream CI is external, so how upstream ran its tests cannot be recovered: section 3.4.
8. Re-check the section 3 SHAs against each provider's `main` immediately before the import (Phase 2).
9. Give the eight test projects unique project and assembly names: section 5.2.
10. Pick one `Npgsql` version, and one `Microsoft.NET.Test.Sdk` and `Microsoft.Data.Sqlite` version, for central package management: section 5.3.
11. Decide where the three sample projects go and where `dbup.snk` lives, then update the `AssemblyOriginatorKeyFile` paths: sections 3.5 and 5.5.
12. Compare the providers' `.editorconfig` with the fork's before deleting it: section 3.4.
