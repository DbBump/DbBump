---
title: How it works
description: The steps the upgrade engine takes to decide which scripts to run, in what order, and how it records them.
---

# How it works

When you call `PerformUpgrade()`, the upgrade engine takes these steps:

1. **Discover.** Ask every [script provider](scripts/script-providers.md) for its scripts. A provider
   can read embedded resources, files on disk, code classes, or anything you write.
2. **Read the journal.** Ask the [journal](running/journaling.md) for the names of the scripts that
   have already run.
3. **Sort.** Order the scripts. By default the order is by
   [run group order](scripts/run-group-order.md), then by name. See
   [Ordering and filtering](scripts/ordering-and-filtering.md).
4. **Filter.** Remove the scripts the journal says have run. Scripts of type
   [`RunAlways`](scripts/script-types.md) are never removed.
5. **Run.** For each remaining script, in order:
   1. Pre-process its text: strip `$schema$.` when there is no schema, replace
      [variables](scripts/variable-substitution.md), then run your
      [pre-processors](scripts/preprocessors.md).
   2. Split it into commands. How a script is split depends on the database: SQL Server splits on
      `GO`, for example.
   3. Run each command.
   4. Record the script in the journal, unless it is `RunAlways`.
   5. Raise the `ScriptExecuted` event.
6. **Report.** Return a `DatabaseUpgradeResult` with the scripts that ran, whether the upgrade
   succeeded, and the error and failing script if it did not.

If a script fails, the engine stops. It does not run the scripts after it. What happens to the
scripts that already ran depends on the [transaction mode](running/transactions.md).

## The parts and where they come from

```text
DeployChanges.To                     -> SupportedDatabases
  .SqlDatabase(...)                  -> provider: connection manager, script executor, journal
  .WithScriptsEmbeddedInAssembly(...)-> script provider
  .LogToConsole()                    -> logger
  .Build()                           -> UpgradeEngine
```

Each builder method adds a step that changes an [`UpgradeConfiguration`](api/configuration.md).
`Build()` runs the steps in the order you called them, checks the configuration, and returns an
[`UpgradeEngine`](running/upgrade-engine.md).

| Part | Interface | Default | Set with |
|---|---|---|---|
| Script source | `IScriptProvider` | none, you must add one | `WithScripts...` |
| Journal | `IJournal` | the provider's journal table | `JournalTo...` |
| Sort order | `IScriptSorter` | run group order, then name | `WithScriptSorter` |
| Name comparison | `ScriptNameComparer` | `StringComparer.Ordinal` | `WithScriptNameComparer` |
| Filter | `IScriptFilter` | drop scripts already run | `WithFilter` |
| Pre-processing | `IScriptPreprocessor` | variable substitution | `WithPreprocessor` |
| Logging | `IUpgradeLog` | no logging | `LogTo...` |
| Transactions | `IConnectionManager` | no transaction | `WithTransaction...` |

## Script names matter

The journal records the **name** of each script, not its contents. This has two results:

- If you change a script after it has run, DbBump does not run it again. Write a new script instead.
- If you rename a script, or move an embedded script to a different folder or namespace, DbBump sees
  a new script and runs it again. To rename scripts safely, use a custom
  [`ScriptNameComparer`](scripts/ordering-and-filtering.md#comparing-script-names).

`GetExecutedButNotDiscoveredScripts()` lists the scripts the journal knows about that no provider
returns any more. It is a quick way to find renamed or deleted scripts.
