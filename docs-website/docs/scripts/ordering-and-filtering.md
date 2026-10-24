---
title: Ordering and filtering
description: Control the order scripts run in, how their names are compared, and which scripts run.
---

# Ordering and filtering

After the providers return their scripts, the engine sorts them and then filters out the ones that
have already run. You can replace each of these steps.

## Sorting

The default sorter orders scripts by [run group order](run-group-order.md), then by name, using the
[script name comparer](#comparing-script-names).

To sort another way, pass a function:

```csharp
builder.WithScriptSorter(scripts => scripts.OrderByDescending(s => s.Name));
```

Or implement `IScriptSorter`:

```csharp
public class ByDateInNameSorter : IScriptSorter
{
    public IEnumerable<SqlScript> Sort(IEnumerable<SqlScript> scripts, ScriptNameComparer comparer)
        => scripts.OrderBy(s => ParseDate(s.Name)).ThenBy(s => s.Name, comparer);
}

builder.WithScriptSorter(new ByDateInNameSorter());
```

Your sorter replaces the default one completely, so it decides whether run group order counts.

## Comparing script names

The script name comparer is used for two things:

1. to sort scripts by name, and
2. to match a script's name against the names in the journal.

The default is `StringComparer.Ordinal`: case sensitive, character by character. Pass any
`IComparer<string>` to change it:

```csharp
// Match and sort names without regard to case
builder.WithScriptNameComparer(StringComparer.OrdinalIgnoreCase);
```

A custom comparer can also handle renamed scripts. If you moved your scripts to a new folder, the
names changed, and DbBump would run them all again. A comparer that treats the old and new names as
equal prevents that:

```csharp
public class MovedScriptsComparer : IComparer<string>
{
    public int Compare(string x, string y)
        => StringComparer.Ordinal.Compare(Normalise(x), Normalise(y));

    static string Normalise(string name)
        => name.Replace("MyApp.Scripts.Old.", "MyApp.Scripts.");
}

builder.WithScriptNameComparer(new MovedScriptsComparer());
```

## Filtering

The default filter keeps a script if its type is `RunAlways`, or if the journal has no record of
it. To change that rule, implement `IScriptFilter`:

```csharp
public class SkipDataScriptsFilter : IScriptFilter
{
    public IEnumerable<SqlScript> Filter(
        IEnumerable<SqlScript> sorted,
        HashSet<string> executedScriptNames,
        ScriptNameComparer comparer)
        => sorted.Where(s =>
            !s.Name.Contains(".Data.") &&
            (s.SqlScriptOptions.ScriptType == ScriptType.RunAlways ||
             !executedScriptNames.Contains(s.Name, comparer)));
}

builder.WithFilter(new SkipDataScriptsFilter());
```

Your filter replaces the default one, so it must also skip the scripts that have already run, as
this example does.

## Choosing scripts by name

Often you just want to include or exclude certain scripts. Every script provider takes a
`Func<string, bool>` filter, and the `Filters` class in the `DbUp` namespace builds common ones:

| Method | Keeps |
|---|---|
| `Filters.ExcludeScripts(params string[] names)` | every script except the named ones |
| `Filters.OnlyIncludeScripts(params string[] names)` | only the named scripts |
| `Filters.ExcludeScriptNamesInFile(string fileName)` | every script except those listed in the file |
| `Filters.OnlyIncludeScriptNamesInFile(string fileName)` | only the scripts listed in the file |

A file lists one script name per line.

```csharp
builder.WithScriptsFromFileSystem(path, Filters.ExcludeScripts("0003-Broken.sql"));
```
