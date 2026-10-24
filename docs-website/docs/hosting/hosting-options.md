---
title: Hosting options
description: Run DbBump from a console app, at application startup, in integration tests or from a deployment tool.
---

# Hosting options

DbBump is a library, so you decide where it runs. Here are the common choices.

## A console application

The approach in [Getting started](../getting-started.md). The scripts and the code that runs them
are in one executable. Developers run it locally, and your deployment pipeline runs it with the
connection string for each environment. Return a non-zero exit code on failure so the pipeline
stops.

## At application startup

A web application or service can upgrade its own database when it starts:

```csharp
var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Default");

var result = DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(typeof(Program).Assembly)
    .LogToConsole()
    .Build()
    .PerformUpgrade();

if (!result.Successful)
    throw new InvalidOperationException("Database upgrade failed.", result.Error);

var app = builder.Build();
// ...
app.Run();
```

:::caution More than one instance

If several instances of the application start at the same time, they may all try to upgrade the
database at once. Run the upgrade from a single deployment step, or take a lock first, if you scale
out.

:::

A gentler version checks `IsUpgradeRequired()` at startup. If an upgrade is needed, the application
goes into a maintenance mode, and an administrator signs in and presses a button to run it.

## In integration tests

Run the upgrade against a fresh database before your tests, so they always test the current schema:

```csharp
public class DatabaseFixture
{
    public DatabaseFixture()
    {
        DropDatabase.For.SqlDatabase(ConnectionString);
        EnsureDatabase.For.SqlDatabase(ConnectionString);

        var result = DeployChanges.To
            .SqlDatabase(ConnectionString)
            .WithScriptsEmbeddedInAssembly(typeof(Program).Assembly)
            .LogToNowhere()
            .Build()
            .PerformUpgrade();

        if (!result.Successful)
            throw result.Error;
    }
}
```

`WithTransactionAlwaysRollback()` runs every script in a transaction and then rolls it back. Use it to
check that your scripts run cleanly against a copy of production, without changing it. See
[Transactions](../running/transactions.md).

## From a deployment tool

- [PowerShell](powershell.md): load the assemblies and call DbBump from a script.
- [Octopus Deploy](octopus-deploy.md): write the scripts that ran to the task summary.
- [DBOps](dbops.md): a PowerShell module built on DbUp, with packaging and CI/CD features.

There are many other ways to use DbBump. If you have one that works well, a pull request to add it
here is welcome.
