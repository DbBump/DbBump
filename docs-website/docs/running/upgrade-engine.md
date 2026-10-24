---
title: The upgrade engine
description: Run an upgrade, preview it, check whether one is needed, and mark scripts as run without running them.
---

# The upgrade engine

`Build()` returns an `UpgradeEngine`. It has methods to run the upgrade and to find out what an
upgrade would do.

```csharp
var upgrader = DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .LogToConsole()
    .Build();
```

## Running the upgrade

```csharp
DatabaseUpgradeResult result = upgrader.PerformUpgrade();

if (!result.Successful)
{
    Console.Error.WriteLine($"Failed in {result.ErrorScript?.Name}: {result.Error}");
    return -1;
}

Console.WriteLine($"Ran {result.Scripts.Count()} scripts.");
```

`PerformUpgrade()` does not throw when a script fails. It logs the error and returns a result:

| Property | Meaning |
|---|---|
| `Successful` | `true` if every script ran. |
| `Scripts` | The scripts that ran, in order. On failure, the scripts that ran before the failure. |
| `Error` | The exception, or `null`. Its `Data` holds the failing script's name. |
| `ErrorScript` | The script that was running when the error happened, or `null`. |

## Before you upgrade

| Method | Returns |
|---|---|
| `TryConnect(out string errorMessage)` | `true` if DbBump can connect to the database. |
| `IsUpgradeRequired()` | `true` if there is at least one script to run. |
| `GetScriptsToExecute()` | The scripts an upgrade would run, sorted and filtered. |
| `GetDiscoveredScripts()` | Every script the providers return, whether it has run or not. |
| `GetExecutedScripts()` | The names of the scripts in the journal. |
| `GetExecutedButNotDiscoveredScripts()` | Names in the journal that no provider returns. These are usually scripts that were renamed or deleted. |

A deployment can use these to show an approver what will change, or to stop early:

```csharp
if (!upgrader.TryConnect(out var error))
{
    Console.Error.WriteLine($"Cannot connect: {error}");
    return -1;
}

if (!upgrader.IsUpgradeRequired())
{
    Console.WriteLine("The database is up to date.");
    return 0;
}

foreach (var script in upgrader.GetScriptsToExecute())
    Console.WriteLine($"Will run {script.Name}");
```

The [HTML report](html-report.md) writes the same list, with each script's contents, to a file.

## Marking scripts as run without running them

`MarkAsExecuted()` records every script that would run in the journal, but does not run it. Use it
to bring a database that was changed by hand, or restored from somewhere else, into line with your
scripts.

```csharp
var result = upgrader.MarkAsExecuted();
```

`MarkAsExecuted(string latestScript)` stops after the script with that name, so you can mark the
scripts up to a point and leave the rest to run:

```csharp
upgrader.MarkAsExecuted("MyApp.Scripts.Script0042 - Last manual change.sql");
upgrader.PerformUpgrade();
```

## Reacting to each script

The engine raises `ScriptExecuted` after each script runs. The `EventArgs` is a
`ScriptExecutedEventArgs` with the `Script` that ran and the `ConnectionManager` it ran on:

```csharp
upgrader.ScriptExecuted += (sender, e) =>
{
    var args = (ScriptExecutedEventArgs)e;
    Console.WriteLine($"Finished {args.Script.Name}");
};
```

See the [API reference](../api/upgrade-engine.md) for the full list of members.
