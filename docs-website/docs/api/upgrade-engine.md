---
title: UpgradeEngine
description: Members of DbUp.Engine.UpgradeEngine.
---

# UpgradeEngine

```csharp
namespace DbUp.Engine;

public class UpgradeEngine
```

Runs the upgrade. Create one with `UpgradeEngineBuilder.Build()`. Every method is `virtual`.

## Constructor

| Constructor | Description |
|---|---|
| `UpgradeEngine(UpgradeConfiguration configuration)` | Create an engine from a configuration. `Build()` does this for you. |

## Methods

| Method | Returns | Description |
|---|---|---|
| `PerformUpgrade()` | `DatabaseUpgradeResult` | Run every script that needs to run. Does not throw when a script fails; check `Successful`. |
| `IsUpgradeRequired()` | `bool` | `true` if any script needs to run. |
| `TryConnect(out string errorMessage)` | `bool` | Try to connect to the database. On failure, `errorMessage` says why. |
| `GetScriptsToExecute()` | `List<SqlScript>` | The scripts an upgrade would run, sorted and filtered. |
| `GetDiscoveredScripts()` | `List<SqlScript>` | Every script the providers return. |
| `GetExecutedScripts()` | `List<string>` | The names of the scripts in the journal. |
| `GetExecutedButNotDiscoveredScripts()` | `List<string>` | Names in the journal that no provider returns. |
| `MarkAsExecuted()` | `DatabaseUpgradeResult` | Record every script that would run in the journal, without running it. |
| `MarkAsExecuted(string latestScript)` | `DatabaseUpgradeResult` | The same, stopping after the script named `latestScript`. |

## Events

| Event | Description |
|---|---|
| `ScriptExecuted` | An `EventHandler` raised after each script runs. The `EventArgs` is a `ScriptExecutedEventArgs`. |

### ScriptExecutedEventArgs

| Property | Type | Description |
|---|---|---|
| `Script` | `SqlScript` | The script that ran. |
| `ConnectionManager` | `IConnectionManager` | The connection manager it ran on. |

## Extension methods

| Method | Namespace | Description |
|---|---|---|
| `GenerateUpgradeHtmlReport(string fullPath)` | `DbUp.Helpers` | Write an HTML report of the scripts to run. See [HTML report](../running/html-report.md). |
| `GenerateUpgradeHtmlReport(string fullPath, string serverName, string databaseName)` | `DbUp.Helpers` | The same, with the server and database names in the report. |

## Protected members

For classes that derive from `UpgradeEngine`:

| Member | Description |
|---|---|
| `configuration` | The `UpgradeConfiguration` the engine was built with. |
| `OnScriptExecuted(ScriptExecutedEventArgs e)` | Raises `ScriptExecuted`. |

See [The upgrade engine](../running/upgrade-engine.md) for examples.
