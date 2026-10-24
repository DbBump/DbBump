---
title: Installation
description: Add the DbBump core package and a database provider to a .NET project.
---

# Installation

DbBump has two parts:

1. **The core library**, `dbbump-core`. It contains the builder, the upgrade engine, the script
   providers, logging and the other database-independent parts.
2. **A database provider.** A provider adds the builder method that targets a database, for example
   `SqlDatabase(...)` for SQL Server or `PostgresqlDatabase(...)` for PostgreSQL. It also supplies
   the journal table, the script executor and the rules for splitting a script into commands.

## Requirements

`dbbump-core` targets `netstandard2.0`. You can use it from:

- .NET 5 and later, including .NET 8 and .NET 10
- .NET Core 2.0 and later
- .NET Framework 4.6.1 and later

## Add the core package

```bash
dotnet add package dbbump-core
```

Or in your project file:

```xml
<ItemGroup>
  <PackageReference Include="dbbump-core" Version="*" />
</ItemGroup>
```

Replace `*` with the version you want to pin to. The package page on
[NuGet](https://www.nuget.org/packages/dbbump-core) lists the releases.

## Add a database provider

:::note Provider packages

DbBump publishes the core library today. The database providers have not been forked yet. Until
they are, the provider for your database comes from the upstream DbUp project. See
[Supported databases](supported-databases.md) for the list and for how to follow the provider work.

:::

## Namespaces

The fork keeps DbUp's namespaces, so the `using` directives are the same as for DbUp:

| Namespace | Contains |
|---|---|
| (global) | `StandardExtensions` (the builder methods), `EnsureDatabase`, `DropDatabase` |
| `DbUp` | `DeployChanges`, `DbUpDefaults`, `Filters`, `OctopusDeployExtensions` |
| `DbUp.Builder` | `UpgradeEngineBuilder`, `UpgradeConfiguration` |
| `DbUp.Engine` | `UpgradeEngine`, `SqlScript`, `SqlScriptOptions`, `IScript`, `IJournal` and the other extension points |
| `DbUp.Engine.Output` | `IUpgradeLog` and the built-in loggers |
| `DbUp.Engine.Transactions` | `IConnectionManager`, `TransactionMode` |
| `DbUp.Helpers` | `NullJournal`, `AdHocSqlRunner`, the HTML report |
| `DbUp.ScriptProviders` | The built-in script providers and `FileSystemScriptOptions` |
| `DbUp.Support` | `ScriptType`, `ScriptNameComparer`, `TableJournal`, `ScriptExecutor` and other base classes for providers |

The builder methods in `StandardExtensions` are in the global namespace, so they need no `using`
directive. Most programs need only `using DbUp;` and `using System.Reflection;`.

## Building from source

To build DbBump itself, see [Contributing](reference/contributing.md).
