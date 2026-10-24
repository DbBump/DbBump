---
title: Getting started
description: Build a console application that upgrades a SQL Server database with DbBump.
---

# Getting started

This guide builds a console application that upgrades a SQL Server database. The steps are the same
for other databases. Only the provider package and the builder method that targets the database
change.

## 1. Create a console application

```bash
dotnet new console -n MyApp.Migrations
cd MyApp.Migrations
dotnet add package dbbump-core
```

Then add the provider for your database. See [Installation](installation.md#add-a-database-provider).

## 2. Add your scripts

Make a `Scripts` folder and put your change scripts in it. DbBump runs scripts in order of their
name, so give each one a prefix that sorts correctly:

```text
Scripts/
  Script0001 - Create tables.sql
  Script0002 - Default feed.sql
  Script0003 - Tags.sql
```

:::tip Pad the numbers

Names are compared as text, so `Script10.sql` sorts before `Script2.sql`. Pad the numbers with
zeros, or use a date and time prefix such as `20261024-1530-AddTags.sql`.

:::

## 3. Embed the scripts in the assembly

Edit the project file so that the scripts are compiled into the assembly as embedded resources:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <EmbeddedResource Include="Scripts/**/*.sql" />
  </ItemGroup>
</Project>
```

The name of an embedded script is its resource name, for example
`MyApp.Migrations.Scripts.Script0001 - Create tables.sql`. That is the name the journal records.

## 4. Write the program

Replace `Program.cs` with:

```csharp
using System;
using System.Linq;
using System.Reflection;
using DbUp;

var connectionString =
    args.FirstOrDefault()
    ?? "Server=(local)\\SqlExpress; Database=MyApp; Trusted_connection=true";

var upgrader = DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .LogToConsole()
    .Build();

var result = upgrader.PerformUpgrade();

if (!result.Successful)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine(result.Error);
    Console.ResetColor();
    return -1;
}

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("Success!");
Console.ResetColor();
return 0;
```

A non-zero exit code tells a build server or deployment tool that the upgrade failed.

### Create the database if it does not exist

If you want the application to create the database too, add this line before you build the
upgrader:

```csharp
EnsureDatabase.For.SqlDatabase(connectionString);
```

It checks whether the target database exists, and creates it if it does not. See
[Creating and dropping databases](running/creating-the-database.md).

## 5. Run it

```bash
dotnet run
```

The first time, every script runs:

![First run: the scripts run](/img/first-run.png)

Run it again, and DbBump finds that every script is already in the journal:

![Second run: the scripts have already run](/img/second-run.png)

Add a `Script0004 - Comments.sql`, run again, and only that script runs.

## Why a console application?

Putting your change scripts in an executable has these benefits:

1. You can press F5 at any time to test the scripts.
2. Other developers on the team can do the same.
3. A deployment pipeline can run it.
4. Your integration tests can run it.
5. It is in your solution, so it is in source control with the rest of your code.

A console application is not the only choice. You can also reference DbBump from a class library and
call it from a maintenance screen in your application, at application startup, or from PowerShell.
See [Hosting options](hosting/hosting-options.md).

## Next steps

- [How it works](how-it-works.md) explains how the engine picks and orders scripts.
- [Script providers](scripts/script-providers.md) covers loading scripts from the file system,
  from code, or from more than one assembly.
- [Transactions](running/transactions.md) explains how to roll back a failed upgrade.
