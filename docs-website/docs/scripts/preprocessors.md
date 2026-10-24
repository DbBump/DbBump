---
title: Pre-processors
description: Change the text of a script before it runs.
---

# Pre-processors

A script pre-processor changes the text of a script just before it runs. DbBump uses them itself:

- [Variable substitution](variable-substitution.md) replaces `$variable$` placeholders.
- `StripSchemaPreprocessor` removes `$schema$.` from scripts when the database has no schema.
- Some providers rewrite types the database does not support. The SQLite provider, for example,
  replaces `nvarchar(max)` with `ntext`.

## Order

Each script is pre-processed in this order:

1. `$schema$.` is removed if no schema is set.
2. Variables are replaced, if variable substitution is on.
3. Your pre-processors run, in the order you added them.

## Writing your own

Implement `IScriptPreprocessor`:

```csharp
public class UppercaseKeywordsPreprocessor : IScriptPreprocessor
{
    public string Process(string contents)
        => Regex.Replace(contents, @"\bcreate table\b", "CREATE TABLE", RegexOptions.IgnoreCase);
}
```

Then register it:

```csharp
DeployChanges.To
    .SqlDatabase(connectionString)
    .WithPreprocessor(new UppercaseKeywordsPreprocessor());
```

A pre-processor sees the text of every script, including code scripts once they have produced their
SQL. It runs on the text that is sent to the database. The journal still records the script under
its original name.
