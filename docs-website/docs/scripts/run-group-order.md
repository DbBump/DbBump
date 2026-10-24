---
title: Run group order
description: Run groups of scripts in a fixed order, such as pre-deployment, deployment and post-deployment scripts.
---

# Run group order

By default, DbBump runs all scripts in order of their name. A run group order puts scripts into
groups. Groups run in ascending order, and the scripts in each group run in order of their name.

A common use is to run some [run-always](script-types.md) scripts before the run-once scripts, and
some after:

```csharp
var assembly = Assembly.GetExecutingAssembly();

var upgrader = DeployChanges.To
    .SqlDatabase(connectionString, null) // null or "" for the user's default schema
    .WithScriptsEmbeddedInAssembly(
        assembly,
        script => script.StartsWith("SampleApplication.PreDeployment."),
        new SqlScriptOptions { ScriptType = ScriptType.RunAlways, RunGroupOrder = 1 })
    .WithScriptsEmbeddedInAssembly(
        assembly,
        script => script.StartsWith("SampleApplication.Scripts."),
        new SqlScriptOptions { ScriptType = ScriptType.RunOnce, RunGroupOrder = 2 })
    .WithScriptsEmbeddedInAssembly(
        assembly,
        script => script.StartsWith("SampleApplication.PostDeployment."),
        new SqlScriptOptions { ScriptType = ScriptType.RunAlways, RunGroupOrder = 3 })
    .LogToConsole()
    .Build();

var result = upgrader.PerformUpgrade();
```

## The default group

Scripts you add without a run group order are in group `100`, the value of
`DbUpDefaults.DefaultRunGroupOrder`. The gap leaves room for groups that run before the standard
scripts (below 100) and after them (above 100), without renumbering:

```csharp
builder
    .WithScriptsEmbeddedInAssembly(assembly, s => s.Contains(".Before."),
        new SqlScriptOptions { ScriptType = ScriptType.RunAlways, RunGroupOrder = 50 })
    .WithScriptsEmbeddedInAssembly(assembly, s => s.Contains(".Scripts."))   // group 100
    .WithScriptsEmbeddedInAssembly(assembly, s => s.Contains(".After."),
        new SqlScriptOptions { ScriptType = ScriptType.RunAlways, RunGroupOrder = 150 });
```

Run group order is part of the default sorter. If you replace the sorter with `WithScriptSorter`,
your sorter decides whether to use it. See [Ordering and filtering](ordering-and-filtering.md).
