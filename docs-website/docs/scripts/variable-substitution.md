---
title: Variable substitution
description: Replace $variable$ placeholders in scripts with values you supply at run time.
---

# Variable substitution

DbBump can replace placeholders in your scripts with values you supply when you configure it. Use it
for values that differ between environments, such as a linked server name or a login.

## Registering variables

One at a time:

```csharp
DeployChanges.To
    .SqlDatabase(connectionString)
    .WithVariable("TestVariable", "Value");
```

Or many at once:

```csharp
var variables = new Dictionary<string, string>
{
    { "Variable1", "Value1" },
    { "Variable2", "Value2" },
    { "Variable3", "Value3" },
};

DeployChanges.To
    .SqlDatabase(connectionString)
    .WithVariables(variables);
```

## Using variables in scripts

Put the variable name between `$` signs:

```sql
-- $TestVariable$ $AnotherVariable$
print '$TestVariable$'
select * from dbo.$TestVariable$
```

becomes:

```sql
-- $TestVariable$ $AnotherVariable$
print 'Value'
select * from dbo.Value
```

## Rules

- Each variable can be added once. Adding the same name twice, with `WithVariable` or
  `WithVariables`, throws an `ArgumentException` when the engine is built.
- A variable name can contain only letters, digits, `_` and `-`. If there are other characters
  between two `$` signs, the text is not treated as a variable.
- If a script uses a variable you did not supply, the upgrade fails with
  `Variable <name> has no value defined`. Variables in comments are left alone, so
  `$AnotherVariable$` in the example above does not cause an error.
- There is no way to escape a `$`. If that is a problem, [open an
  issue](https://github.com/DbBump/DbBump/issues).

### The `schema` variable is reserved

Providers set a variable called `schema` to the quoted name of the schema you passed to the builder.
Scripts can write `$schema$.MyTable` to refer to a table in that schema. When no schema is set,
DbBump removes `$schema$.` from scripts so the names resolve to the default schema. Do not use
`schema` for your own variable.

## Turning substitution off

Variable substitution is on by default. If your scripts contain `$` signs that are not variables,
turn it off:

```csharp
builder.WithVariablesDisabled();
```

`WithVariablesEnabled()` turns it back on.
