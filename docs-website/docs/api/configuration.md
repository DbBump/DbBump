---
title: Configuration
description: Members of UpgradeEngineBuilder and UpgradeConfiguration.
---

# Configuration

## UpgradeEngineBuilder

```csharp
namespace DbUp.Builder;

public class UpgradeEngineBuilder
```

Collects configuration steps, then builds an `UpgradeEngine`. Provider methods create the builder,
and the [builder methods](builder.md) add steps to it. To add your own configuration, write an
extension method that calls `Configure`.

| Member | Description |
|---|---|
| `Configure(Action<UpgradeConfiguration> configuration)` | Add a step. Steps run in the order they were added, when the engine is built. |
| `BuildConfiguration()` | Create an `UpgradeConfiguration`, run every step on it, call `Validate()`, and return it. |
| `Build()` | Call `BuildConfiguration()` and return a new `UpgradeEngine`. |
| `callbacks` (protected) | The list of steps. |

### Writing your own builder method

```csharp
public static class MyBuilderExtensions
{
    public static UpgradeEngineBuilder WithStandardSettings(this UpgradeEngineBuilder builder)
    {
        builder.Configure(c =>
        {
            c.ScriptNameComparer = new ScriptNameComparer(StringComparer.OrdinalIgnoreCase);
            c.ConnectionManager.TransactionMode = TransactionMode.SingleTransaction;
        });
        return builder;
    }
}
```

## UpgradeConfiguration

```csharp
namespace DbUp.Builder;

public class UpgradeConfiguration
```

Holds everything the engine needs. You change it through `Configure`.

| Property | Type | Default | Description |
|---|---|---|---|
| `ConnectionManager` | `IConnectionManager` | set by the provider | Opens connections, manages transactions and splits scripts into commands. |
| `ScriptProviders` | `List<IScriptProvider>` | empty | Where scripts come from. |
| `ScriptPreprocessors` | `List<IScriptPreprocessor>` | empty | Pre-processors to run after variable substitution. |
| `Journal` | `IJournal` | set by the provider | Records which scripts have run. |
| `ScriptExecutor` | `IScriptExecutor` | set by the provider | Runs scripts against the database. |
| `ScriptSorter` | `IScriptSorter` | `DefaultScriptSorter` | Orders scripts by run group order, then name. |
| `ScriptNameComparer` | `ScriptNameComparer` | wraps `StringComparer.Ordinal` | Compares names for sorting and for matching the journal. |
| `ScriptFilter` | `IScriptFilter` | `DefaultScriptFilter` | Removes scripts that have run, except `RunAlways` scripts. |
| `Variables` | `Dictionary<string, string>` | empty | Values for variable substitution. |
| `VariablesEnabled` | `bool` | `true` | Whether variables are substituted. |
| `Log` | `IAggregateLog` | no loggers | All the configured loggers. Read-only outside the library; use `AddLog`, or `ResetConfiguredLoggers()` on the builder to clear it. |

| Method | Description |
|---|---|
| `AddLog(IUpgradeLog logger)` | Add a logger. A `null` logger is ignored. |
| `AddVariables(IDictionary<string, string> newVariables)` | Add variables. Throws `ArgumentException` if a variable with the same name was already added. |
| `Validate()` | Throw `ArgumentException` if the connection manager, script executor, journal or script sorter is missing, or if no script provider was added. `BuildConfiguration()` calls it. |
