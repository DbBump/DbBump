---
slug: /api
title: API reference
description: Reference for the public API of the dbbump-core package.
---

# API reference

This section lists the public API of `dbbump-core`. The guides explain when and why to use each
feature. These pages list what is there.

| Page | Covers |
|---|---|
| [Builder methods](builder.md) | `DeployChanges.To` and every configuration method on `UpgradeEngineBuilder` |
| [UpgradeEngine](upgrade-engine.md) | Running, previewing and marking upgrades |
| [Configuration](configuration.md) | `UpgradeEngineBuilder` and `UpgradeConfiguration` |
| [Scripts and results](scripts.md) | `SqlScript`, `SqlScriptOptions`, `ScriptType`, `FileSystemScriptOptions`, `DatabaseUpgradeResult`, `DbUpDefaults` |
| [Extensibility](extensibility.md) | The interfaces you implement to replace parts of the engine |
| [Helpers](helpers.md) | `EnsureDatabase`, `DropDatabase`, `Filters`, `NullJournal`, `AdHocSqlRunner`, the HTML report, Octopus Deploy |

## The shape of the API

```csharp
UpgradeEngine engine = DeployChanges.To   // SupportedDatabases
    .SqlDatabase(connectionString)        // provider method -> UpgradeEngineBuilder
    .WithScripts...(...)                  // StandardExtensions -> UpgradeEngineBuilder
    .Build();                             // UpgradeEngine

DatabaseUpgradeResult result = engine.PerformUpgrade();
```

- `DeployChanges.To` returns a `SupportedDatabases`. It has no members of its own. Provider packages
  add extension methods to it that return an `UpgradeEngineBuilder`.
- Every configuration method is an extension method on `UpgradeEngineBuilder` and returns the same
  builder, so calls chain.
- `Build()` applies the configuration and returns an `UpgradeEngine`.

All the members are documented with XML comments, so your IDE shows the same descriptions.
