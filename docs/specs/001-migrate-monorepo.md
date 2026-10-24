# DbUp Monorepo Consolidation & CI/CD Specification

**Status:** Proposed  
**Project:** DbUp fork (DbBump / DbGo)  
**Platform:** .NET, C#, GitHub Actions, NuGet  
**Versioning:** Unified SemVer across all published packages

## 1. Objective

Consolidate the existing DbUp core fork and eight upstream database provider repositories into a single Git monorepo.

The resulting repository must:

- Retain all existing core functionality and supported database providers.
- Preserve upstream Git history for each imported provider where practical.
- Support building and testing the entire solution from a single checkout.
- Replace internal NuGet dependencies with local project references.
- Centralise shared MSBuild properties and NuGet package versions.
- Use one unified product version for every published package.
- Support automated CI validation, integration testing, package creation, and NuGet publishing through GitHub Actions.
- Retain the ability to incorporate future fixes from the upstream DbUp projects.
- Maintain the existing MIT copyright and licence requirements.

This phase is primarily a structural migration, not a redesign of the DbUp APIs.

## 2. Scope

### 2.1 Repositories to import

Use the existing fork of `DbUp/DbUp` as the destination repository.

Import the following upstream repositories:

| Repository | Target provider |
|---|---|
| `DbUp/dbup-sqlserver` | SqlServer |
| `DbUp/dbup-postgresql` | PostgreSql |
| `DbUp/dbup-mysql` | MySql |
| `DbUp/dbup-sqlite` | Sqlite |
| `DbUp/dbup-oracle` | Oracle |
| `DbUp/dbup-firebird` | Firebird |
| `DbUp/dbup-redshift` | Redshift |
| `DbUp/dbup-clickhouse` | ClickHouse |

All source repositories must be fetched from their official GitHub locations.

Record each imported repository's URL, branch or tag, commit SHA, import date, original licence, and destination directory.

### 2.2 Out of scope

- Rewriting the database migration engine.
- Introducing new providers.
- Changing schema journaling or migration semantics.
- Implementing a new CLI.
- Renaming every public namespace or API as part of the initial consolidation.
- Supporting upstream end-of-life providers.
- Automatically synchronising upstream changes.

Branding and public API renaming should be a separate, deliberate change after the consolidated solution passes its baseline tests.

## 3. Repository structure

Use the following target structure. Preserve the existing core projects and their logical divisions rather than flattening them unnecessarily.

```text
/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── integration.yml
│   │   └── release.yml
│   └── dependabot.yml
├── build/
│   ├── validate-packages.ps1
│   └── README.md
├── docs/
├── samples/
├── src/
│   ├── Core/
│   ├── SqlServer/
│   ├── PostgreSql/
│   ├── MySql/
│   ├── Sqlite/
│   ├── Oracle/
│   ├── Firebird/
│   ├── Redshift/
│   └── ClickHouse/
├── tests/
│   ├── Core/
│   ├── SqlServer/
│   ├── PostgreSql/
│   ├── MySql/
│   ├── Sqlite/
│   ├── Oracle/
│   ├── Firebird/
│   ├── Redshift/
│   └── ClickHouse/
├── upstream/
│   └── manifest.json
├── Directory.Build.props
├── Directory.Build.targets
├── Directory.Packages.props
├── global.json
├── NuGet.Config
├── GitVersion.yml
├── Product.slnx
├── LICENSE
├── README.md
└── CHANGELOG.md
```

`Product.slnx` is a placeholder for the final product name.

The folders represent logical source boundaries; actual project names and nesting should be determined from the imported repositories.

Where the existing core repository already provides a suitable structure, prefer integrating with it over unnecessarily moving files.

## 4. Git import strategy

### 4.1 Requirements

Provider repositories must not be added as Git submodules.

Prefer history-preserving imports using `git subtree`, initially targeting dedicated directories that do not collide with the core's existing `src` and `tests` directories.

Example import:

```bash
git remote add upstream-sqlserver \
  https://github.com/DbUp/dbup-sqlserver.git

git fetch upstream-sqlserver

git subtree add \
  --prefix=imports/dbup-sqlserver \
  upstream-sqlserver main
```

Do not use `--squash` for initial imports if historical commit preservation is required.

Repeat for each provider.

The import operation should be performed on a dedicated integration branch, for example:

```text
chore/consolidate-dbup-providers
```

After importing:

1. Verify all repository histories are accessible.
2. Record the imported commit SHA.
3. Identify the actual source, tests, examples and build files within each provider.
4. Relocate source and tests into the chosen monorepo layout using `git mv` where practical.
5. Consolidate duplicate repository-level configuration.
6. Remove obsolete standalone provider CI and release configuration.
7. Retain the original licences and copyright notices.

If preserving a straightforward future subtree pull is important, retain stable provider import directories rather than relocating their contents. This is an acceptable alternative to the flattened layout.

**Important:** History preservation and convenient upstream synchronisation are separate goals. Relocating files after import can make later upstream merges substantially harder.

Document which approach was selected and its implications before completing the migration.

### 4.2 Import manifest

Create `upstream/manifest.json` containing information equivalent to:

```json
{
  "repositories": [
    {
      "name": "dbup-sqlserver",
      "url": "https://github.com/DbUp/dbup-sqlserver",
      "revision": "<full-commit-sha>",
      "importPath": "imports/dbup-sqlserver",
      "sourcePath": "src/SqlServer",
      "historyPreserved": true
    }
  ]
}
```

The manifest must reflect actual imported revisions rather than placeholders when the implementation is complete.

## 5. Project and dependency consolidation

### 5.1 Solution

Create or update the root `.slnx` file.

All maintained projects must be included:

- Core library projects
- Eight provider library projects
- Unit test projects
- Integration test projects
- Supported sample projects where appropriate

Ensure that one command restores and builds the entire solution.

### 5.2 Local project references

Every provider must reference the local core project rather than a published `dbup-core` NuGet package.

Example:

```xml
<ItemGroup>
  <ProjectReference
    Include="../../Core/DbUp.Core/DbUp.Core.csproj" />
</ItemGroup>
```

Resolve the actual path during implementation.

Remove references to the upstream DbUp GitHub Packages feed where they exist solely for internal project dependencies.

Provider-specific external packages must remain as NuGet dependencies.

Avoid circular project references.

### 5.3 Central package management

Introduce `Directory.Packages.props` using NuGet Central Package Management.

Example:

```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>

  <ItemGroup>
    <!-- External package versions go here -->
  </ItemGroup>
</Project>
```

Move compatible external `PackageReference` versions out of individual `.csproj` files and into this file.

Do not blindly unify versions where different projects genuinely require incompatible dependencies. Resolve and test those cases explicitly.

### 5.4 Central MSBuild configuration

Use `Directory.Build.props` to configure shared build properties, such as:

- Nullable reference types, where already supported
- Implicit usings, where appropriate
- Deterministic builds
- SourceLink
- NuGet repository URL
- Package licence expression
- Package author and metadata
- Shared code analysis settings

Avoid introducing new warnings-as-errors requirements until existing imported projects have been validated.

Existing target frameworks must be inventoried before introducing a new framework support policy.

Retain supported target framework compatibility during the initial migration.

## 6. Unified package versioning

### 6.1 Versioning rules

All packages produced by the monorepo must use exactly the same package version for a given release.

Example:

```text
DbBump.Core        1.0.0
DbBump.SqlServer   1.0.0
DbBump.PostgreSql  1.0.0
DbBump.MySql       1.0.0
DbBump.Sqlite      1.0.0
DbBump.Oracle      1.0.0
DbBump.Firebird    1.0.0
DbBump.Redshift    1.0.0
DbBump.ClickHouse  1.0.0
```

Package IDs in this example are provisional. If the core produces additional packages, those must follow the same versioning rules.

### 6.2 Version authority

Use a single repository-level versioning strategy.

Preferred implementation: GitVersion, since the upstream already uses it.

Requirements:

- One root `GitVersion.yml`.
- Remove imported provider-specific `GitVersion.yml` files.
- One calculated version per workflow execution.
- All projects consume the same calculated version.
- Release versions come from Git tags such as `v1.0.0`.
- Prerelease packages use SemVer-compatible identifiers such as `1.1.0-beta.1`.
- No provider can independently override its package version.

The release process must resolve the version once and pass it to all `dotnet pack` commands, for example through `-p:PackageVersion=<resolved-version>`.

If GitVersion is not needed beyond tag interpretation, an alternative implementation may derive the version from a validated Git tag. Do not maintain two competing version calculation mechanisms.

### 6.3 Publishing rules

- Every stable release publishes the entire set of maintained NuGet packages.
- Unchanged providers receive the same new version as changed providers.
- All package artifacts are built from the same Git commit.
- A failing package build or validation prevents the release.
- Package publishing is not triggered by ordinary pull requests.
- Existing NuGet versions must never be overwritten.
- The release process must refuse to publish a version when any expected package version already exists on the destination feed.
- Failed partial releases require explicit recovery; do not silently skip duplicates and declare success.

NuGet publishing is not transactional. The workflow must recognise that some packages could be published before a later push fails.

## 7. Continuous integration

### 7.1 Workflow: ci.yml

Triggers:

- Pull requests into `main`
- Pushes to `main`
- Manual workflow dispatch

CI must run on GitHub-hosted runners using the repository's pinned .NET SDK.

Required stages:

1. Checkout with sufficient Git history for version calculation.
2. Install .NET SDK.
3. Restore NuGet packages.
4. Build the complete solution in Release configuration.
5. Run fast unit tests.
6. Collect test results and code coverage.
7. Pack all publishable library projects into a local output directory.
8. Validate package metadata, dependencies and versions.
9. Upload test and package artifacts as appropriate.

Example baseline:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-dotnet@v4
        with:
          global-json-file: global.json
          cache: true
          cache-dependency-path: '**/packages.lock.json'

      - name: Restore
        run: dotnet restore Product.slnx --locked-mode

      - name: Build
        run: >
          dotnet build Product.slnx
          --configuration Release
          --no-restore

      - name: Unit tests
        run: >
          dotnet test Product.slnx
          --configuration Release
          --no-build
          --filter "Category!=Integration"
          --logger trx
          --results-directory ./TestResults

      - name: Pack
        run: >
          dotnet pack Product.slnx
          --configuration Release
          --no-build
          --output ./artifacts/packages
          -p:PackageVersion=0.0.0-ci
```

This is an illustrative workflow, not the final required YAML.

The implementation must:

- Replace `Product.slnx` with the real solution name.
- Verify all selected projects support the .NET SDK and CLI options.
- Ensure unit and integration tests are correctly classified.
- Ensure package locking is enabled and lock files exist before using `--locked-mode`.
- Set `IsPackable=false` on non-package projects.
- Ensure CI versions are valid and cannot collide with published versions.
- Add package validation and artifact upload stages.
- Pin production workflow actions to reviewed commit SHAs.

CI must never publish packages.

### 7.2 Code coverage

Collect coverage for applicable test projects.

Publish test results as workflow artifacts.

Coverage collection must not require access to production databases.

Avoid establishing an arbitrary coverage threshold during the initial migration. First establish the baseline, then optionally enforce minimum coverage.

## 8. Database integration testing

### 8.1 Workflow: integration.yml

Integration tests must use real database engines wherever feasible.

Run:

- On pull requests when integration-relevant code changes
- On pushes to `main`
- On a nightly schedule
- As a required release gate

Use a GitHub Actions matrix or separate jobs per database provider.

Recommended initial infrastructure:

| Provider | Test infrastructure |
|---|---|
| SQL Server | SQL Server Linux container |
| PostgreSQL | PostgreSQL container |
| MySQL | MySQL container |
| SQLite | Local SQLite database |
| Oracle | Compatible Oracle database container |
| Firebird | Firebird container |
| ClickHouse | ClickHouse container |
| Redshift | Managed test environment or documented substitute |

Redshift should not be treated as fully validated merely because its code builds or passes tests against PostgreSQL.

Database containers should use explicitly pinned image versions.

Each integration test suite must:

1. Create an isolated test database or schema.
2. Apply a series of migrations.
3. Confirm expected schema changes.
4. Confirm migration journal entries.
5. Run migrations a second time and verify previously applied scripts are not rerun.
6. Verify behaviour when a migration fails.
7. Clean up test resources.

Transaction and rollback behaviour must be tested according to each provider's actual guarantees rather than assuming all database engines behave identically.

Where infrastructure is unavailable, explicitly mark coverage as incomplete. Never silently treat skipped integration tests as passing.

### 8.2 Release gating

For a production release, all providers designated as supported must have passing integration tests against their intended database platforms.

If a provider cannot be tested reliably, either provision suitable test infrastructure or explicitly exclude that provider from supported release scope.

## 9. Release automation

### 9.1 Workflow: release.yml

Trigger from version tags matching the project's release naming convention.

Example:

```text
v1.0.0
v1.1.0
v2.0.0-beta.1
```

The workflow must validate the tag against SemVer and derive the package version.

### 9.2 Release stages

**Stage A — Validate**

- Check out the exact tagged commit.
- Resolve and validate version.
- Restore and build the solution.
- Execute required unit tests.
- Execute required integration tests.
- Fail if the release version already exists on the publishing feed.

**Stage B — Package**

- Pack all publishable library projects.
- Apply the one resolved version to every package.
- Validate every package contains expected assemblies, dependencies and metadata.
- Verify all expected package IDs are present.
- Verify all package versions are identical.
- Verify no package uses an unintended upstream DbUp Core NuGet dependency.

**Stage C — Publish**

- Publish packages to NuGet.org using a protected GitHub Actions environment.
- Authenticate using a narrowly scoped publishing credential or supported trusted publishing mechanism.
- Publish only after all validation gates pass.
- Never publish a partially validated set.

**Stage D — GitHub Release**

- Attach the `.nupkg` and `.snupkg` artifacts.
- Publish release notes.
- Record the release commit and package version.
- Mark prerelease versions appropriately.

Release publication must be idempotent at the workflow level: rerunning an already completed release should detect existing packages and stop safely rather than attempting an overwrite.

### 9.3 Release workflow security

Configure:

- Restricted workflow permissions
- A protected `nuget-release` environment
- Environment approval rules where appropriate
- Restricted publishing credentials
- Concurrency controls to prevent simultaneous production releases
- Immutable or protected version tags, where repository settings permit

Never expose publishing credentials to pull request workflows from forks.

## 10. NuGet package requirements

Every NuGet package must include:

- Correct package ID and version
- Description
- Authors and copyright metadata
- MIT licence expression or equivalent compliant metadata
- Repository URL
- SourceLink information
- XML documentation where applicable
- Appropriate dependency metadata
- Symbol package where supported

Core/provider dependencies must reference the renamed core package when the package branding is finalised.

When producing NuGet packages from `ProjectReference` dependencies, verify that the generated `.nuspec` contains the correct core package dependency at the unified version.

Do not assume that a successful `dotnet pack` automatically establishes the desired consumer-facing dependency graph.

## 11. Branding and compatibility

The first consolidation milestone should preserve source-level compatibility wherever possible.

Separate subsequent changes into:

1. Package ID rebranding
2. Assembly naming
3. Namespace rebranding
4. Public API changes

Avoid blanket text replacement of `DbUp` across source code, metadata, documentation and licences.

Copyright notices must remain intact.

The repository README must clearly describe the project as an independent fork based on DbUp, without suggesting official affiliation.

Before releasing packages under DbBump or DbGo, confirm the chosen NuGet package IDs are available and the branding is suitably distinct.

## 12. Documentation

Update the root documentation to include:

- Supported database providers
- Local development prerequisites
- How to restore, build and test the whole solution
- How to run database integration tests
- Package naming and installation examples
- Unified versioning policy
- Release process
- Contribution guidelines
- Upstream source attribution
- Known differences from DbUp

Document upstream synchronisation separately.

The upstream documentation must not remain in a state that incorrectly instructs users to configure DbUp's GitHub Packages feed or use obsolete provider repositories.

## 13. Implementation phases

### Phase 1 — Baseline and inventory

- [ ] Record current fork branch, commit and working tree state.
- [ ] Identify every core project and package.
- [ ] Identify all eight upstream provider repositories.
- [ ] Record exact source revisions.
- [ ] Inventory frameworks, dependencies and test infrastructure.
- [ ] Capture the existing build/test baseline.
- [ ] Identify package ID and namespace conflicts.

**Acceptance:** A complete source inventory and known baseline exist before structural changes begin.

### Phase 2 — Repository import

- [ ] Create consolidation branch.
- [ ] Import provider repositories with history.
- [ ] Preserve original copyright/licence files.
- [ ] Create upstream import manifest.
- [ ] Consolidate source and test layout.
- [ ] Remove redundant standalone build files.

**Acceptance:** All expected source projects and relevant history are present in the destination repository.

### Phase 3 — Build consolidation

- [ ] Generate root solution.
- [ ] Introduce central MSBuild configuration.
- [ ] Introduce central package version management.
- [ ] Replace internal package references.
- [ ] Resolve duplicate build configuration.
- [ ] Restore and build the complete solution.
- [ ] Run existing unit tests.

**Acceptance:** A clean checkout can restore, build and run unit tests without relying on unpublished upstream DbUp packages.

### Phase 4 — CI

- [ ] Create CI workflow.
- [ ] Enable deterministic builds.
- [ ] Configure unit testing and results.
- [ ] Configure package validation.
- [ ] Enable branch protection for required checks.

**Acceptance:** Pull requests automatically validate the entire solution.

### Phase 5 — Integration testing

- [ ] Establish provider integration test matrix.
- [ ] Configure database test containers.
- [ ] Implement or migrate integration test configuration.
- [ ] Add nightly integration checks.
- [ ] Define unsupported or blocked test environments.

**Acceptance:** All supported providers have verified database integration coverage.

### Phase 6 — Unified versioning and release

- [ ] Consolidate version configuration.
- [ ] Ensure every publishable package uses the same version.
- [ ] Configure protected publishing environment.
- [ ] Create package validation script.
- [ ] Create release workflow.
- [ ] Perform a non-publishing release rehearsal.
- [ ] Validate produced NuGet packages in a separate consumer project.
- [ ] Publish the initial release only after all gates pass.

**Acceptance:** One tagged commit produces a complete, consistent set of versioned packages.

### Phase 7 — Documentation and cleanup

- [ ] Update documentation and examples.
- [ ] Remove obsolete provider-specific CI files.
- [ ] Document source attribution.
- [ ] Document upstream update strategy.
- [ ] Review security and dependency management.
- [ ] Confirm no obsolete upstream package references remain.

**Acceptance:** The monorepo is independently buildable, maintainable and releasable.

## 14. Final acceptance criteria

The migration is considered complete only when all the following conditions are satisfied.

1. All eight provider repositories have been imported.
2. The existing core functionality remains intact.
3. Every maintained project builds from the monorepo.
4. Local project references replace internal published core-package dependencies.
5. Central package management is operational.
6. Existing tests pass, with any accepted exceptions explicitly documented.
7. Supported providers pass their integration tests.
8. CI automatically validates pull requests.
9. All produced NuGet packages share an identical version.
10. A tagged release can publish the complete package set.
11. The package dependency graph references the correct renamed packages.
12. A separate sample application can install and consume the produced packages.
13. Historical upstream attribution is retained.
14. One documented process exists for future upstream imports.
15. A developer can clone the repository and run the normal build without separately cloning provider repositories.

## 15. Implementation principles

- Prefer minimal behavioural changes during consolidation.
- Preserve history and attribution.
- Prioritise a working build before cosmetic refactoring.
- Preserve package modularity despite repository consolidation.
- Use one version authority.
- Keep publishing distinct from pull request validation.
- Make CI repeatable and deterministic.
- Do not silently omit a provider from builds, tests or releases.
- Record any deliberate deviations from this specification.

**Expected deliverable:** A pull request against the existing core fork containing the consolidated provider source, unified solution and build configuration, GitHub Actions workflows, versioning, package validation, updated documentation, and a successful release rehearsal.
