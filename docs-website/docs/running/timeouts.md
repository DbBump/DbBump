---
title: Timeouts
description: Set how long each command in a script may run.
---

# Timeouts

Long-running scripts, such as an index rebuild or a large data migration, can exceed the database
driver's default command timeout. Set a longer one with `WithExecutionTimeout`:

```csharp
DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .WithExecutionTimeout(TimeSpan.FromMinutes(10))
    .Build();
```

The timeout applies to each command, not to the whole script or the whole upgrade. A script that is
split into several commands (for example on `GO` in SQL Server) gives each command the full time.

| Value | Effect |
|---|---|
| A `TimeSpan` | Each command may run for that long. It is rounded to whole seconds. |
| `TimeSpan.Zero` | No limit, for drivers that treat `0` as "wait forever", such as `SqlClient`. |
| `null` | Use the driver's default timeout. |

A negative value, or one longer than `int.MaxValue` seconds, throws `ArgumentOutOfRangeException`.
