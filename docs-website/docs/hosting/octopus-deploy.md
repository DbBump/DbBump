---
title: Octopus Deploy
description: Show the scripts an upgrade ran in the Octopus Deploy task summary.
---

# Octopus Deploy

[Octopus Deploy](https://octopus.com/) runs a deployment step and shows its output in the task log.
DbBump has a helper that highlights the scripts that ran, so they appear in the task summary.

```csharp
using DbUp;

var result = upgrader.PerformUpgrade();

result.WriteExecutedScriptsToOctopusTaskSummary();
```

`WriteExecutedScriptsToOctopusTaskSummary` is an extension method on `DatabaseUpgradeResult` in the
`DbUp` namespace. It writes the number of scripts that ran, then each script's name, between the
`##octopus[stdout-highlight]` and `##octopus[stdout-default]` service messages. Octopus shows the
lines between them as highlighted output.

Call it after a failed upgrade too: it lists the scripts that ran before the failure.

## Running DbBump from Octopus

You can run your migrations from Octopus in either of two ways:

- Package your [console application](hosting-options.md#a-console-application) and run it in a
  "Run a script" step, passing the connection string as an argument.
- Call DbBump from a [PowerShell](powershell.md) step.

[DBOps](dbops.md) packages also deploy with Octopus, through the `deploy.ps1` in each package.
