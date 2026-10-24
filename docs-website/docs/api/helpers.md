---
title: Helpers
description: EnsureDatabase, DropDatabase, Filters, NullJournal, AdHocSqlRunner, the HTML report and the Octopus Deploy helper.
---

# Helpers

## DeployChanges, EnsureDatabase and DropDatabase

| Entry point | Namespace | Returns | Description |
|---|---|---|---|
| `DeployChanges.To` | `DbUp` | `SupportedDatabases` | Start configuring an upgrade. |
| `EnsureDatabase.For` | global | `SupportedDatabasesForEnsureDatabase` | Create the database if it does not exist. |
| `DropDatabase.For` | global | `SupportedDatabasesForDropDatabase` | Drop the database. |

The methods on each come from the provider packages. See
[Creating and dropping databases](../running/creating-the-database.md).

## Filters

```csharp
namespace DbUp;

public static class Filters
```

Builds `Func<string, bool>` filters to pass to a script provider.

| Method | Keeps |
|---|---|
| `ExcludeScripts(params string[] scriptNames)` | Every script except the named ones. |
| `OnlyIncludeScripts(params string[] scriptNames)` | Only the named scripts. |
| `ExcludeScriptNamesInFile(string fileName)` | Every script except those listed in the file, one per line. |
| `OnlyIncludeScriptNamesInFile(string fileName)` | Only the scripts listed in the file. |

## NullJournal

```csharp
namespace DbUp.Helpers;

public class NullJournal : IJournal
```

A journal that records nothing and reports that nothing has run, so every script runs every time.
See [Journaling](../running/journaling.md#nulljournal).

## AdHocSqlRunner

```csharp
namespace DbUp.Helpers;

public class AdHocSqlRunner
```

Runs one-off SQL with the same variable substitution and pre-processors as an upgrade. It is handy
in tests and in [code scripts](../scripts/code-scripts.md).

| Constructor | Description |
|---|---|
| `AdHocSqlRunner(Func<IDbCommand> commandFactory, ISqlObjectParser sqlObjectParser, string schema, params IScriptPreprocessor[] additionalScriptPreprocessors)` | Variable substitution is on. |
| `AdHocSqlRunner(Func<IDbCommand> commandFactory, ISqlObjectParser sqlObjectParser, string schema, Func<bool> variablesEnabled, params IScriptPreprocessor[] additionalScriptPreprocessors)` | |

| Member | Description |
|---|---|
| `WithVariable(string variableName, string value)` | Add a variable. Returns the runner. |
| `Schema` | The schema, or `null` if the database has none. |
| `ExecuteScalar(string query, params Expression<Func<string, object>>[] parameters)` | Run a query and return the first column of the first row. |
| `ExecuteNonQuery(string query, params Expression<Func<string, object>>[] parameters)` | Run a command and return the number of rows changed. |
| `ExecuteReader(string query, params Expression<Func<string, object>>[] parameters)` | Run a query and return each row as a `Dictionary<string, string>`. Columns must have unique names. |

Parameters are lambdas. The lambda's parameter name is the SQL parameter name, and its body is the
value:

```csharp
var count = runner.ExecuteScalar(
    "select count(*) from Customer where Country = @country",
    country => "NZ");
```

## UpgradeEngineHtmlReport

```csharp
namespace DbUp.Helpers;

public static class UpgradeEngineHtmlReport
```

| Method | Description |
|---|---|
| `GenerateUpgradeHtmlReport(this UpgradeEngine upgradeEngine, string fullPath)` | Write an HTML report of the scripts to run. |
| `GenerateUpgradeHtmlReport(this UpgradeEngine upgradeEngine, string fullPath, string serverName, string databaseName)` | The same, with the server and database names. |

See [HTML report](../running/html-report.md).

## OctopusDeployExtensions

```csharp
namespace DbUp;

public static class OctopusDeployExtensions
```

| Method | Description |
|---|---|
| `WriteExecutedScriptsToOctopusTaskSummary(this DatabaseUpgradeResult result)` | Write the scripts that ran to the console as Octopus highlighted output. |

See [Octopus Deploy](../hosting/octopus-deploy.md).
