---
title: Logging
description: Send DbBump's log to the console, Trace, Microsoft.Extensions.Logging or your own logger.
---

# Logging

DbBump logs through the `IUpgradeLog` interface. If you do not configure a logger, nothing is
logged.

## Built-in loggers

| Builder method | Logs to |
|---|---|
| `LogToConsole()` | The console, in colour. |
| `LogToTrace()` | `System.Diagnostics.Trace`. |
| `LogTo(ILogger logger)` | A [Microsoft.Extensions.Logging](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging) `ILogger`. |
| `LogTo(ILoggerFactory loggerFactory)` | A logger created from an `ILoggerFactory`. |
| `LogTo(IUpgradeLog log)` | Your own `IUpgradeLog`. |
| `LogToNowhere()` | Nowhere. Messages are discarded. |

Some providers add more. The SQL Server provider has `LogToSqlContext()` for SQL CLR on .NET
Framework.

## Combining loggers

Each `LogTo...` call adds a logger. It does not replace the ones before it. Every message goes to
every logger you added:

```csharp
builder
    .LogToConsole()
    .LogToTrace();
```

To remove the loggers added so far, call `ResetConfiguredLoggers()`:

```csharp
builder
    .LogToConsole()
    .ResetConfiguredLoggers()   // console logging removed
    .LogToTrace();              // only Trace remains
```

These methods call `builder.Configure(c => c.AddLog(log))` behind the scenes.

## Logging script output

By default, the output of your scripts, such as the text of `PRINT` statements in SQL Server, is not
logged. To log it too, call `LogScriptOutput()`:

```csharp
DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .LogToConsole()
    .LogScriptOutput()
    .Build();
```

## Microsoft.Extensions.Logging

Pass an `ILogger` or `ILoggerFactory` to log through any
[Microsoft.Extensions.Logging provider](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging-providers#third-party-logging-providers).
This example uses Serilog:

```csharp
var loggerFactory = new LoggerFactory().AddSerilog(
    new LoggerConfiguration()
        .WriteTo.Console()
        .CreateLogger());

DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .LogTo(loggerFactory)
    .LogScriptOutput()
    .Build();
```

In an application that uses dependency injection, resolve an `ILogger<T>` and pass that:

```csharp
var logger = services.GetRequiredService<ILogger<Program>>();
builder.LogTo(logger);
```

## Writing your own logger

Implement `IUpgradeLog`:

```csharp
public class MyLog : IUpgradeLog
{
    public void LogTrace(string format, params object[] args) { }
    public void LogDebug(string format, params object[] args) { }
    public void LogInformation(string format, params object[] args) => Write("INFO", format, args);
    public void LogWarning(string format, params object[] args) => Write("WARN", format, args);
    public void LogError(string format, params object[] args) => Write("ERROR", format, args);
    public void LogError(Exception ex, string format, params object[] args)
        => Write("ERROR", format + Environment.NewLine + ex, args);

    static void Write(string level, string format, object[] args)
        => Console.WriteLine($"[{level}] {string.Format(format, args)}");
}

builder.LogTo(new MyLog());
```
