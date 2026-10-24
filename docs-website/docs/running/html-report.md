---
title: HTML report
description: Write an HTML report of the scripts an upgrade will run, for approvers to review.
---

# HTML report

People trust an automated deployment more when they can see what it will do. Many deployment tools
let an approver check a change before it goes out, and can publish files for the approver to read.

DbBump can write an HTML report of every script an upgrade will run, with each script's contents.
Publish it from your deployment tool, and the approver can read the exact SQL before they approve.

![A sample HTML report](/img/sample-html-report.png)

## Generating the report

`GenerateUpgradeHtmlReport` is an extension method on `UpgradeEngine`. It is in the `DbUp.Helpers`
namespace:

```csharp
using DbUp.Helpers;

upgrader.GenerateUpgradeHtmlReport("C:\\DeploymentLocation\\UpgradeReport.html");
```

An overload also takes the server name and database name to show in the report:

```csharp
upgrader.GenerateUpgradeHtmlReport(
    "UpgradeReport.html",
    serverName: "sql01",
    databaseName: "MyApp");
```

The report does not run any scripts.

## A program that reports or upgrades

Here a command-line switch picks between writing the report and running the upgrade:

```csharp
using System;
using System.Linq;
using System.Reflection;
using DbUp;
using DbUp.Helpers;

var connectionString =
    args.FirstOrDefault(a => !a.StartsWith("--"))
    ?? "Server=(local)\\SqlExpress; Database=MyApp; Trusted_connection=true";

var upgrader = DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .LogToConsole()
    .Build();

// --generateReport is an example name. Use any switch you like.
if (args.Any(a => "--generateReport".Equals(a, StringComparison.OrdinalIgnoreCase)))
{
    upgrader.GenerateUpgradeHtmlReport("C:\\DeploymentLocation\\UpgradeReport.html");
    return 0;
}

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

Run it once with `--generateReport` in a step before the approval, and again without it after the
approval.
