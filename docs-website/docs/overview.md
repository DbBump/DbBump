---
slug: /
title: Overview
description: DbBump is a .NET library that deploys changes to a database by running SQL change scripts that have not run yet.
---

# DbBump

DbBump is a set of .NET libraries that deploys changes to a database. It keeps a record of the SQL
scripts that have already run against the database, and it runs only the scripts that are new. Run
it on a new database and every script runs. Run it again and nothing happens. Add a script and only
that script runs.

DbBump is a fork of [DbUp](https://github.com/DbUp/DbUp). The aim of the fork is to work through
DbUp's open issues and pull requests: review them, triage them, fix them and merge them. The public
API is the same as DbUp's and keeps the `DbUp` namespace, so code written for DbUp works with
DbBump.

## Why DbBump

- **Plain SQL.** Your change scripts are ordinary `.sql` files. There is no DSL to learn, and your
  DBA can read every change.
- **Transitions, not states.** Each script describes how to move the database one step forward.
  You decide how existing data moves when a column splits or changes type. See
  [the philosophy behind DbUp](reference/philosophy.md).
- **Source controlled.** Scripts live next to your code and are reviewed in the same pull request.
- **Runs anywhere .NET runs.** A console app, a test, a web app at startup, a PowerShell step in
  your deployment pipeline.
- **Extensible.** Script sources, the journal, logging, sorting, filtering and pre-processing are
  all interfaces you can replace.

## A first look

```csharp
using System.Reflection;
using DbUp;

var upgrader = DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .LogToConsole()
    .Build();

var result = upgrader.PerformUpgrade();

return result.Successful ? 0 : -1;
```

`DeployChanges.To` starts a builder. A database provider adds the method that picks the database
(`SqlDatabase` here). You then say where the scripts come from, how to log, and call `Build()` to
get an [`UpgradeEngine`](running/upgrade-engine.md). `PerformUpgrade()` runs the new scripts and
records each one in the journal table.

## Where to go next

- [Installation](installation.md): add the packages to a project.
- [Getting started](getting-started.md): build a console app that upgrades a database.
- [How it works](how-it-works.md): how the engine decides which scripts to run, and in what order.
- [API reference](api/index.md): every builder method and the types they configure.
