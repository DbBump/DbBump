---
title: Builder methods
description: Every configuration method on UpgradeEngineBuilder, grouped by what it configures.
---

# Builder methods

These extension methods are in the `StandardExtensions` class, in the global namespace. Each one
takes an `UpgradeEngineBuilder` and returns the same builder.

Methods that add scripts can be called more than once. Each call adds another script provider.
Methods that set a single part, such as the journal or the sorter, replace what an earlier call set.

## Scripts: embedded resources

Without a filter, only resources ending in `.sql` are taken. A filter you pass replaces that rule.

| Method | Description |
|---|---|
| `WithScriptsEmbeddedInAssembly(Assembly assembly)` | Embedded `.sql` resources in the assembly. |
| `WithScriptsEmbeddedInAssembly(Assembly, SqlScriptOptions)` | The same, with script options. |
| `WithScriptsEmbeddedInAssembly(Assembly, Encoding)` | The same, read with an encoding. |
| `WithScriptsEmbeddedInAssembly(Assembly, Encoding, SqlScriptOptions)` | |
| `WithScriptsEmbeddedInAssembly(Assembly, Func<string, bool> filter)` | Resources whose name passes the filter. |
| `WithScriptsEmbeddedInAssembly(Assembly, Func<string, bool>, SqlScriptOptions)` | |
| `WithScriptsEmbeddedInAssembly(Assembly, Func<string, bool>, Encoding)` | |
| `WithScriptsEmbeddedInAssembly(Assembly, Func<string, bool>, Encoding, SqlScriptOptions)` | |
| `WithScriptsEmbeddedInAssemblies(Assembly[] assemblies)` | Embedded `.sql` resources in several assemblies. |
| `WithScriptsEmbeddedInAssemblies(Assembly[], Func<string, bool>)` | |
| `WithScriptsEmbeddedInAssemblies(Assembly[], Func<string, bool>, SqlScriptOptions)` | |
| `WithScriptsEmbeddedInAssemblies(Assembly[], Encoding)` | |
| `WithScriptsEmbeddedInAssemblies(Assembly[], Func<string, bool>, Encoding)` | |
| `WithScriptsEmbeddedInAssemblies(Assembly[], Func<string, bool>, Encoding, SqlScriptOptions)` | |
| `WithScriptsAndCodeEmbeddedInAssembly(Assembly assembly)` | Embedded `.sql` resources and `IScript` classes. |
| `WithScriptsAndCodeEmbeddedInAssembly(Assembly, SqlScriptOptions)` | |
| `WithScriptsAndCodeEmbeddedInAssembly(Assembly, Func<string, bool> filter)` | One filter for resources and code scripts. |
| `WithScriptsAndCodeEmbeddedInAssembly(Assembly, Func<string, bool>, SqlScriptOptions)` | |
| `WithScriptsAndCodeEmbeddedInAssembly(Assembly, Func<string, bool> filter, Func<string, bool> codeScriptFilter)` | `filter` picks resources; `codeScriptFilter` filters the combined list. |
| `WithScriptsAndCodeEmbeddedInAssembly(Assembly, Func<string, bool>, Func<string, bool>, SqlScriptOptions)` | |

See [Script providers](../scripts/script-providers.md).

## Scripts: file system

Without options, only `*.sql` files in the top folder are taken.

| Method | Description |
|---|---|
| `WithScriptsFromFileSystem(string path)` | `.sql` files in the folder. |
| `WithScriptsFromFileSystem(string, SqlScriptOptions)` | |
| `WithScriptsFromFileSystem(string, Func<string, bool> filter)` | Files whose path passes the filter. |
| `WithScriptsFromFileSystem(string, Func<string, bool>, SqlScriptOptions)` | |
| `WithScriptsFromFileSystem(string, Encoding)` | |
| `WithScriptsFromFileSystem(string, Encoding, SqlScriptOptions)` | |
| `WithScriptsFromFileSystem(string, Func<string, bool>, Encoding)` | |
| `WithScriptsFromFileSystem(string, Func<string, bool>, Encoding, SqlScriptOptions)` | |
| `WithScriptsFromFileSystem(string, FileSystemScriptOptions)` | Full control. See [`FileSystemScriptOptions`](scripts.md#filesystemscriptoptions). |
| `WithScriptsFromFileSystem(string, FileSystemScriptOptions, SqlScriptOptions)` | |

## Scripts: from code

| Method | Description |
|---|---|
| `WithScripts(IScriptProvider scriptProvider)` | Your own provider. |
| `WithScripts(IEnumerable<SqlScript> scripts)` | A list of scripts. |
| `WithScripts(params SqlScript[] scripts)` | |
| `WithScript(SqlScript script)` | One script. |
| `WithScript(string name, string contents)` | One script from a name and its SQL. |
| `WithScript(string name, string contents, SqlScriptOptions)` | |
| `WithScript(string name, IScript script)` | One [code script](../scripts/code-scripts.md). |
| `WithScript(string name, IScript script, SqlScriptOptions)` | |
| `WithScripts(params IScript[] scripts)` | Code scripts, each named after its type's full name plus `.cs`. |
| `WithScripts(Func<IScript, string> namer, params IScript[] scripts)` | Code scripts named by `namer`. |
| `WithScripts(Func<IScript, string> namer, SqlScriptOptions, params IScript[] scripts)` | |

## Ordering and filtering

| Method | Description |
|---|---|
| `WithScriptSorter(IScriptSorter sorter)` | Replace the sorter. |
| `WithScriptSorter(Func<IEnumerable<SqlScript>, IEnumerable<SqlScript>> sortFunction)` | Replace the sorter with a function. |
| `WithScriptNameComparer(IComparer<string> comparer)` | Compare names for sorting and for matching the journal. Default `StringComparer.Ordinal`. |
| `WithFilter(IScriptFilter filter)` | Replace the filter that removes scripts already run. |

See [Ordering and filtering](../scripts/ordering-and-filtering.md).

## Pre-processing and variables

| Method | Description |
|---|---|
| `WithPreprocessor(IScriptPreprocessor preprocessor)` | Add a pre-processor. They run in the order added. |
| `WithVariable(string variableName, string value)` | Add one variable. |
| `WithVariables(IDictionary<string, string> variables)` | Add several variables. |
| `WithVariablesDisabled()` | Turn variable substitution off. |
| `WithVariablesEnabled()` | Turn variable substitution on. This is the default. |

See [Variable substitution](../scripts/variable-substitution.md) and
[Pre-processors](../scripts/preprocessors.md).

## Journal

| Method | Description |
|---|---|
| `JournalTo(IJournal journal)` | Use this journal. It does not take part in transactions. |
| `JournalTo(Func<Func<IConnectionManager>, Func<IUpgradeLog>, IJournal> createJournal)` | Build the journal from the connection manager and log. It can take part in transactions. |

Providers add methods such as `JournalToSqlTable(schema, table)`. See
[Journaling](../running/journaling.md).

## Transactions and timeouts

| Method | Description |
|---|---|
| `WithoutTransaction()` | No transaction. The default. |
| `WithTransactionPerScript()` | One transaction per script. |
| `WithTransaction()` | One transaction for the whole upgrade. |
| `WithTransactionAlwaysRollback()` | One transaction for the whole upgrade, always rolled back. |
| `WithExecutionTimeout(TimeSpan? timeout)` | Timeout for each command. `null` uses the driver's default. |

See [Transactions](../running/transactions.md) and [Timeouts](../running/timeouts.md).

## Logging

| Method | Description |
|---|---|
| `LogToConsole()` | Log to the console in colour. |
| `LogToTrace()` | Log to `System.Diagnostics.Trace`. |
| `LogTo(IUpgradeLog log)` | Log to your own logger. |
| `LogTo(ILogger logger)` | Log to a Microsoft.Extensions.Logging logger. |
| `LogTo(ILoggerFactory loggerFactory)` | Log to a logger created by the factory. |
| `LogToNowhere()` | Discard log messages. |
| `ResetConfiguredLoggers()` | Remove every logger added so far. |
| `LogScriptOutput()` | Also log the output of the scripts, such as `PRINT` messages. |

Logger methods add to the loggers already configured. See [Logging](../running/logging.md).

## Building

These are methods on `UpgradeEngineBuilder` itself:

| Method | Description |
|---|---|
| `Configure(Action<UpgradeConfiguration> configuration)` | Add a step that changes the configuration. Every method above is built on this. |
| `BuildConfiguration()` | Run the steps and return the `UpgradeConfiguration`, after validating it. |
| `Build()` | Build the configuration and return an `UpgradeEngine`. |

See [Configuration](configuration.md).
