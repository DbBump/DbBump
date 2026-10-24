---
title: Breaking changes
description: Breaking changes between major versions of DbUp, which DbBump inherits.
---

# Breaking changes

DbBump continues from DbUp 6. These are the breaking changes in DbUp's major releases. Other
release notes are in [DbUp's GitHub releases](https://github.com/DbUp/DbUp/releases) and in
[DbBump's releases](https://github.com/DbBump/DbBump/releases).

## Moving from DbUp to DbBump

- Replace the `dbup-core` package with `dbbump-core`.
- The namespaces and types are unchanged, so your code does not change.
- The assembly is named `dbbump-core.dll`. Update any script that loads the assembly by name, such
  as a [PowerShell](../hosting/powershell.md) script.
- See [Supported databases](../supported-databases.md) for the state of the provider packages.

## 6.0.0

- LibLog has been replaced by the standard .NET `ILogger` abstraction.
  - The automatic logger detection that LibLog provided is removed.
  - `MultipleUpgradeLog` has been replaced by `AggregateLog`.
  - `IUpgradeLogger` still exists, but its methods are renamed from `Write*` to `Log*` to match
    Microsoft's `ILogger` interface.
- Scripts with `ScriptType.RunAlways`
  [are no longer journaled](https://github.com/DbUp/DbUp/issues/789).
- Only `netstandard2.0` compatible frameworks are supported:
  - .NET 5.0 and later
  - .NET Core 2.0 and later
  - .NET Framework 4.6.1
- All dependencies have been updated to their latest release.
- SQL Server provider: `System.Data.SqlClient` is replaced by `Microsoft.Data.SqlClient`.
- MySQL provider: [`MySqlConnector` is used](https://github.com/DbUp/dbup-mysql/pull/9) instead of
  `MySql.Data`.

## 5.0.0

- Removed unsupported target frameworks: .NET Framework 3.5 and .NET Framework 4.5. Added .NET
  Framework 4.6.2.
- `Microsoft.Data.SqlClient` is used for `net6.0` targets instead of `System.Data.SqlClient`.

## 4.0.0

- If `builder.LogTo...()` is called more than once, the loggers are combined instead of the last one
  replacing the others.
- The default encoding is now UTF-8 instead of `Encoding.Default`.
- `AdHocSqlRunner` takes `Expression<Func<>>` instead of `Func<>`.
- `EmbeddedScriptAndCodeProvider`, used by `WithScriptsAndCodeEmbeddedInAssembly`, now applies the
  filter to code scripts too.
- `IJournal` has a new method, `EnsureTableExistsAndIsLatestVersion(Func<IDbCommand> dbCommandFactory)`.
- `TableJournal`'s `protected void EnsureTableIsLatestVersion()` is now
  `public virtual void EnsureTableExistsAndIsLatestVersion(Func<IDbCommand> dbCommandFactory)`.
