---
title: Scripts and results
description: SqlScript, SqlScriptOptions, ScriptType, FileSystemScriptOptions, DatabaseUpgradeResult and DbUpDefaults.
---

# Scripts and results

## SqlScript

```csharp
namespace DbUp.Engine;

public class SqlScript
```

A script with a name and its SQL.

| Constructor | Description |
|---|---|
| `SqlScript(string name, string contents)` | A run-once script in the default run group. |
| `SqlScript(string name, string contents, SqlScriptOptions sqlScriptOptions)` | A script with options. |

| Property | Type | Description |
|---|---|---|
| `Name` | `string` | The name recorded in the journal. `virtual`. |
| `Contents` | `string` | The SQL. `virtual`. |
| `SqlScriptOptions` | `SqlScriptOptions` | The script type and run group order. |

| Static method | Description |
|---|---|
| `FromFile(string path)` | Read a file with the default encoding (UTF-8). The name is the file name. |
| `FromFile(string path, Encoding encoding)` | |
| `FromFile(string basePath, string path, Encoding encoding)` | The name is the path relative to `basePath`, with folder separators replaced by dots. |
| `FromFile(string basePath, string path, Encoding encoding, SqlScriptOptions)` | |
| `FromStream(string scriptName, Stream stream)` | Read a stream with the default encoding. |
| `FromStream(string scriptName, Stream stream, Encoding encoding)` | |
| `FromStream(string scriptName, Stream stream, Encoding encoding, SqlScriptOptions)` | |

`LazySqlScript`, also in `DbUp.Engine`, is a `SqlScript` whose contents come from a function that
runs the first time they are read. Code scripts use it.

## SqlScriptOptions

```csharp
namespace DbUp.Engine;

public class SqlScriptOptions
```

| Property | Type | Default | Description |
|---|---|---|---|
| `ScriptType` | `ScriptType` | `RunOnce` | Whether the script runs once or every time. |
| `RunGroupOrder` | `int` | `100` | Groups run in ascending order. See [Run group order](../scripts/run-group-order.md). |

## ScriptType

```csharp
namespace DbUp.Support;

public enum ScriptType
```

| Value | Description |
|---|---|
| `RunOnce` | Run once and record in the journal. |
| `RunAlways` | Run on every upgrade and do not record in the journal. |

See [Script types](../scripts/script-types.md).

## FileSystemScriptOptions

```csharp
namespace DbUp.ScriptProviders;

public class FileSystemScriptOptions
```

| Property | Type | Default | Description |
|---|---|---|---|
| `IncludeSubDirectories` | `bool` | `false` | Search subfolders too. |
| `Extensions` | `string[]` | `{ "*.sql" }` | Search patterns for files. |
| `Encoding` | `Encoding` | UTF-8 | Encoding to read files with. |
| `Filter` | `Func<string, bool>` | `null` | Return `false` to skip a file. Receives the file's path, or only its name when `UseOnlyFilenameForScriptName` is set. |
| `UseOnlyFilenameForScriptName` | `bool` | `false` | Name scripts by file name alone. Duplicate file names then throw an exception. |

## DatabaseUpgradeResult

```csharp
namespace DbUp.Engine;

public sealed class DatabaseUpgradeResult
```

| Property | Type | Description |
|---|---|---|
| `Successful` | `bool` | `true` if every script ran. |
| `Scripts` | `IEnumerable<SqlScript>` | The scripts that ran, or were marked, in order. |
| `Error` | `Exception` | The error, or `null`. |
| `ErrorScript` | `SqlScript` | The script that was running when the error happened, or `null`. |

| Extension method | Namespace | Description |
|---|---|---|
| `WriteExecutedScriptsToOctopusTaskSummary()` | `DbUp` | See [Octopus Deploy](../hosting/octopus-deploy.md). |

## DbUpDefaults

```csharp
namespace DbUp;

public static class DbUpDefaults
```

Process-wide defaults. They are public static fields, so you can change them at startup, before you
build an engine.

| Field | Type | Default | Description |
|---|---|---|---|
| `DefaultEncoding` | `Encoding` | `Encoding.UTF8` | The encoding used to read scripts when none is given. |
| `DefaultRunGroupOrder` | `int` | `100` | The run group order of a new `SqlScriptOptions`. |
