---
title: Script providers
description: Load change scripts from embedded resources, the file system, code, or a provider of your own.
---

# Script providers

A script provider finds the scripts to run. You can add as many providers as you like. The engine
asks each one for its scripts and then [sorts](ordering-and-filtering.md) them all together.

Every `WithScripts...` method has an overload that takes a
[`SqlScriptOptions`](script-types.md). Use it to set the script type or run group order of every
script that provider returns.

## Embedded in one assembly

Finds scripts embedded as resources in an assembly.

```csharp
builder.WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly());
```

With no filter, it takes every resource whose name ends in `.sql`, ignoring case. If you pass a
filter, it replaces that rule, so your filter must exclude non-`.sql` resources itself:

```csharp
builder.WithScriptsEmbeddedInAssembly(
    Assembly.GetExecutingAssembly(),
    name => name.StartsWith("MyApp.Migrations.Scripts.") && name.EndsWith(".sql"));
```

The script name is the resource name, for example `MyApp.Migrations.Scripts.Script0001.sql`.

Overloads let you pass a filter, an `Encoding` (the default is UTF-8) and `SqlScriptOptions`.

## Embedded in more than one assembly

```csharp
builder.WithScriptsEmbeddedInAssemblies(
    new[] { Assembly.GetExecutingAssembly(), typeof(Something).Assembly },
    name => name.StartsWith("Script"));
```

## From the file system

Reads scripts from a folder on disk.

```csharp
// Every *.sql file in the folder
builder.WithScriptsFromFileSystem(path);

// Every *.sql file whose path passes the filter
builder.WithScriptsFromFileSystem(path, filePath => filePath.Contains("good"));

// Read with a specific encoding
builder.WithScriptsFromFileSystem(path, Encoding.UTF8);

// Filter and encoding
builder.WithScriptsFromFileSystem(path, filePath => filePath.Contains("good"), Encoding.UTF8);
```

For full control, pass a `FileSystemScriptOptions`:

```csharp
var options = new FileSystemScriptOptions
{
    // Search subfolders too. The default is false: the top folder only.
    IncludeSubDirectories = true,

    // Search patterns. The default is "*.sql".
    Extensions = new[] { "*.sql" },

    // The encoding to read files with. The default is UTF-8.
    Encoding = Encoding.UTF8,

    // Each file path found is passed to this function. Return false to skip the file.
    Filter = filePath => filePath.Contains("value"),

    // Name scripts by file name alone, without the subfolder. The default is false.
    UseOnlyFilenameForScriptName = false,
};

builder.WithScriptsFromFileSystem(path, options);
```

### How file scripts are named

By default, a script's name is its path relative to `path`, with each folder separator replaced by a
dot. `path/Sprint1/0001-Tables.sql` becomes `Sprint1.0001-Tables.sql`. Moving a file to a different
folder therefore changes its name, and DbBump will run it again.

Set `UseOnlyFilenameForScriptName = true` to name scripts by file name only. Then two files with the
same name in different folders are an error, and DbBump throws an exception that lists them.

## From code

Supply scripts directly, without a file or a resource:

```csharp
// One script
builder.WithScript("0001-Tables.sql", "create table Foo (Id int)");

// Many scripts
builder.WithScripts(
    new SqlScript("script1.sql", "content"),
    new SqlScript("script2.sql", "content2"));

// Your own provider
builder.WithScripts(new MyCustomScriptProvider());
```

`SqlScript.FromFile(path)` and `SqlScript.FromStream(name, stream)` build a `SqlScript` from a file
or a stream.

To generate a script in C# at run time, see [Code scripts](code-scripts.md).

## Embedded SQL and code scripts together

Finds both the embedded `.sql` resources and every non-abstract class that implements
[`IScript`](code-scripts.md) in an assembly:

```csharp
builder.WithScriptsAndCodeEmbeddedInAssembly(Assembly.GetExecutingAssembly());
```

A code script is named after its class's full name with `.cs` added, for example
`MyApp.Migrations.Scripts.Script0005ComplexUpdate.cs`. The SQL and code scripts are sorted
together by name.

If you pass one filter, it applies to both the resource names and the code script names. You can
pass a second filter, `codeScriptFilter`. The first filter then picks the embedded resources, and the
second filter is applied to the combined list of SQL and code scripts. The second filter must
therefore accept the SQL scripts you want as well as the code scripts:

```csharp
builder.WithScriptsAndCodeEmbeddedInAssembly(
    Assembly.GetExecutingAssembly(),
    filter: name => name.EndsWith(".sql"),
    codeScriptFilter: name => name.StartsWith("MyApp.Migrations.Scripts."));
```

:::warning SQL injection

DbBump does not protect against SQL injection. A code script can build a script from data in your
database. If that data ends up in the script, it can contain an injection attack.

:::

## Writing your own provider

Implement `IScriptProvider`:

```csharp
public class HttpScriptProvider : IScriptProvider
{
    public IEnumerable<SqlScript> GetScripts(IConnectionManager connectionManager)
    {
        // Fetch scripts from anywhere: a web service, a blob store, a zip file.
        yield return new SqlScript("0001-Remote.sql", Download("0001-Remote.sql"));
    }
}

builder.WithScripts(new HttpScriptProvider());
```

The `IConnectionManager` lets a provider read from the target database while it builds its list.
