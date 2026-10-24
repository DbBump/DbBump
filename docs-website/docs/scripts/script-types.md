---
title: Script types
description: Run a script once, or run it on every deployment.
---

# Script types

By default each script runs once. The journal records it, and DbBump never runs it again.

Some scripts are better run on every deployment, for example to:

- make sure a role exists and has the right permissions;
- load or refresh reference data;
- make sure users are in a particular role;
- recreate views, functions and stored procedures after the schema changes.

The `ScriptType` enum in `DbUp.Support` has two values:

| Value | Behaviour |
|---|---|
| `RunOnce` | The default. The script runs once and is recorded in the journal. |
| `RunAlways` | The script runs on every upgrade and is **not** recorded in the journal. |

:::caution Write RunAlways scripts so they can run again

A `RunAlways` script must be safe to run any number of times. Check whether something exists before
you create it:

```sql
if database_principal_id('Testing_Role') is null
begin
    create role Testing_Role
end
```

:::

## Setting the script type

Pass a `SqlScriptOptions` when you add scripts. It applies to every script that provider returns:

```csharp
var upgrader = DeployChanges.To
    .SqlDatabase(connectionString, null) // null or "" for the user's default schema
    .WithScriptsEmbeddedInAssembly(
        Assembly.GetExecutingAssembly(),
        new SqlScriptOptions { ScriptType = ScriptType.RunAlways })
    .LogToConsole()
    .Build();

var result = upgrader.PerformUpgrade();
```

## Mixing run-once and run-always scripts

Put the two kinds of script in different folders and add each folder with its own options:

```csharp
var upgrader = DeployChanges.To
    .SqlDatabase(connectionString, null)
    .WithScriptsEmbeddedInAssembly(
        Assembly.GetExecutingAssembly(),
        script => script.StartsWith("SampleApplication.Scripts."),
        new SqlScriptOptions { ScriptType = ScriptType.RunOnce })
    .WithScriptsEmbeddedInAssembly(
        Assembly.GetExecutingAssembly(),
        script => script.StartsWith("SampleApplication.RunAlways."),
        new SqlScriptOptions { ScriptType = ScriptType.RunAlways })
    .LogToConsole()
    .Build();
```

All the scripts are still sorted together by name. To run the run-always scripts before or after the
run-once scripts, give each group a [run group order](run-group-order.md).

## Always run every script

To run every script on every upgrade, use a journal that records nothing. See
[`NullJournal`](../running/journaling.md#nulljournal).
