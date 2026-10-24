---
title: Extensibility
description: The interfaces you implement to replace parts of the upgrade engine, and the base classes providers build on.
---

# Extensibility

Most parts of the engine are interfaces. Implement one and register it with the builder to change
how DbBump works.

## For applications

### IScriptProvider

```csharp
namespace DbUp.Engine;

public interface IScriptProvider
{
    IEnumerable<SqlScript> GetScripts(IConnectionManager connectionManager);
}
```

Supplies scripts. Register with `WithScripts(IScriptProvider)`. See
[Script providers](../scripts/script-providers.md#writing-your-own-provider).

### IScript

```csharp
namespace DbUp.Engine;

public interface IScript
{
    string ProvideScript(Func<IDbCommand> dbCommandFactory);
}
```

A script that generates its SQL at run time. See [Code scripts](../scripts/code-scripts.md).

### IScriptPreprocessor

```csharp
namespace DbUp.Engine;

public interface IScriptPreprocessor
{
    string Process(string contents);
}
```

Changes a script's text before it runs. Register with `WithPreprocessor`. See
[Pre-processors](../scripts/preprocessors.md).

Built-in: `VariableSubstitutionPreprocessor` and `StripSchemaPreprocessor`, in
`DbUp.Engine.Preprocessors`.

### IScriptSorter

```csharp
namespace DbUp.Engine;

public interface IScriptSorter
{
    IEnumerable<SqlScript> Sort(IEnumerable<SqlScript> scripts, ScriptNameComparer comparer);
}
```

Orders scripts. Register with `WithScriptSorter`. Built-in: `DefaultScriptSorter` (run group order,
then name) and `DelegateScriptSorter` (wraps a function), in `DbUp.Engine.Sorters`.

### IScriptFilter

```csharp
namespace DbUp.Engine;

public interface IScriptFilter
{
    IEnumerable<SqlScript> Filter(
        IEnumerable<SqlScript> sorted,
        HashSet<string> executedScriptNames,
        ScriptNameComparer comparer);
}
```

Decides which sorted scripts run. Register with `WithFilter`. Built-in: `DefaultScriptFilter` in
`DbUp.Engine.Filters`, which keeps `RunAlways` scripts and scripts not in the journal.

### ScriptNameComparer

```csharp
namespace DbUp.Support;

public class ScriptNameComparer : IComparer<string>, IEqualityComparer<string>
{
    public ScriptNameComparer(IComparer<string> comparer);
}
```

Wraps an `IComparer<string>` so it can both sort names and test them for equality. Set it with
`WithScriptNameComparer(IComparer<string>)`, which wraps the comparer for you.

### IJournal

```csharp
namespace DbUp.Engine;

public interface IJournal
{
    string[] GetExecutedScripts();
    void StoreExecutedScript(SqlScript script, Func<IDbCommand> dbCommandFactory);
    void EnsureTableExistsAndIsLatestVersion(Func<IDbCommand> dbCommandFactory);
}
```

Records which scripts have run. Register with `JournalTo`. Built-in: `NullJournal` in
`DbUp.Helpers`, and `TableJournal` in `DbUp.Support` as a base class. See
[Journaling](../running/journaling.md).

### IUpgradeLog

```csharp
namespace DbUp.Engine.Output;

public interface IUpgradeLog
{
    void LogTrace(string format, params object[] args);
    void LogDebug(string format, params object[] args);
    void LogInformation(string format, params object[] args);
    void LogWarning(string format, params object[] args);
    void LogError(string format, params object[] args);
    void LogError(Exception ex, string format, params object[] args);
}
```

Receives log messages. Register with `LogTo(IUpgradeLog)`. Built-in, in `DbUp.Engine.Output`:

| Class | Logs to |
|---|---|
| `ConsoleUpgradeLog` | The console, in colour. |
| `TraceUpgradeLog` | `System.Diagnostics.Trace`. |
| `MicrosoftUpgradeLog` | A Microsoft.Extensions.Logging `ILogger`. |
| `NoOpUpgradeLog` | Nowhere. |
| `AggregateLog` | Every logger added to it. The configuration's `Log` is one of these. |

See [Logging](../running/logging.md).

## For providers

These interfaces are what a database provider supplies. You need them only to write a provider, or
to change how one behaves.

### IConnectionManager

```csharp
namespace DbUp.Engine.Transactions;

public interface IConnectionManager
{
    IDisposable OperationStarting(IUpgradeLog upgradeLog, List<SqlScript> executedScripts);
    void ExecuteCommandsWithManagedConnection(Action<Func<IDbCommand>> action);
    T ExecuteCommandsWithManagedConnection<T>(Func<Func<IDbCommand>, T> actionWithResult);
    TransactionMode TransactionMode { get; set; }
    bool IsScriptOutputLogged { get; set; }
    IEnumerable<string> SplitScriptIntoCommands(string scriptContents);
    bool TryConnect(IUpgradeLog upgradeLog, out string errorMessage);
    int? ExecutionTimeoutSeconds { get; set; }
}
```

Opens connections, applies the transaction mode, and splits a script into the commands to run.
`DatabaseConnectionManager` is the base class providers derive from. The transaction strategies
(`NoTransactionStrategy`, `TransactionPerScriptStrategy`, `SingleTransactionStrategy`,
`SingleTransactionAlwaysRollbackStrategy`) implement `ITransactionStrategy`.

### TransactionMode

```csharp
namespace DbUp.Engine.Transactions;

public enum TransactionMode
{
    NoTransaction,
    SingleTransaction,
    TransactionPerScript,
    SingleTransactionAlwaysRollback,
}
```

See [Transactions](../running/transactions.md).

### IScriptExecutor

```csharp
namespace DbUp.Engine;

public interface IScriptExecutor
{
    void Execute(SqlScript script);
    void Execute(SqlScript script, IDictionary<string, string> variables);
    void VerifySchema();
    int? ExecutionTimeoutSeconds { get; set; }
}
```

Pre-processes and runs a script, and records it in the journal. `ScriptExecutor` in `DbUp.Support`
is the base class. Override `PreprocessScriptContents` to change pre-processing, and
`UseTheSameTransactionForJournalTableAndScripts` to return `false` for databases, such as Firebird,
that must create the journal table and run scripts in separate transactions.

### ISqlObjectParser

```csharp
namespace DbUp.Engine;

public interface ISqlObjectParser
{
    string QuoteIdentifier(string objectName);
    string UnquoteIdentifier(string objectName);
    string QuoteIdentifier(string objectName, ObjectNameOptions objectNameOptions);
}
```

Quotes and unquotes object names for the database. `SqlObjectParser` in `DbUp.Support` is the base
class.

### SupportedDatabases

```csharp
public class SupportedDatabases;
public class SupportedDatabasesForEnsureDatabase;
public class SupportedDatabasesForDropDatabase;
```

Empty classes, in the global namespace. `DeployChanges.To`, `EnsureDatabase.For` and
`DropDatabase.For` return them. A provider adds extension methods to them for its database.
