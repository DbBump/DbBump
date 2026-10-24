---
title: Code scripts
description: Generate a change script in C# at run time with access to an open database connection.
---

# Code scripts

Some changes need more logic than is easy to write in SQL. A code script generates its SQL in C#.
When it is the script's turn to run, DbBump gives it a factory that creates commands on an open
connection.

A code script is a class that implements `IScript`:

```csharp
public interface IScript
{
    string ProvideScript(Func<IDbCommand> dbCommandFactory);
}
```

`ProvideScript` is called when the script's turn comes, so every script before it has already run.
It returns SQL, which DbBump then runs like any other script.

## Build SQL from a query

This script reads rows and returns a set of `INSERT` statements:

```csharp
public class Script0005ComplexUpdate : IScript
{
    public string ProvideScript(Func<IDbCommand> commandFactory)
    {
        var cmd = commandFactory();
        cmd.CommandText = "select * from SomeTable";
        var scriptBuilder = new StringBuilder();

        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                scriptBuilder.AppendLine(
                    string.Format("insert into AnotherTable values ({0})", reader.GetString(0)));
            }
        }

        return scriptBuilder.ToString();
    }
}
```

## Do the whole change in code

The command factory can do more than read. A script can make the whole change itself and return an
empty string:

```csharp
public class Script0006UpdateInCode : IScript
{
    public string ProvideScript(Func<IDbCommand> commandFactory)
    {
        var command = commandFactory();
        command.CommandText = "create table [dbo].[Foo]( [Name] nvarchar(max) not null )";
        command.ExecuteNonQuery();

        return "";
    }
}
```

:::warning SQL injection

The first example concatenates data from the database into SQL. That is open to SQL injection if the
data can contain SQL. Use this feature with care, and make sure the data you read cannot contain
injected SQL. Prefer command parameters when you run commands yourself.

:::

## Registering code scripts

Discover every `IScript` class in an assembly, together with the embedded `.sql` scripts:

```csharp
builder.WithScriptsAndCodeEmbeddedInAssembly(Assembly.GetExecutingAssembly());
```

Each class is named after its full type name with `.cs` added, and sorts with the SQL scripts by
name. Name your classes so they sort into the right place, for example by matching the number in
your `.sql` file names.

Or register instances yourself:

```csharp
// Named explicitly
builder.WithScript("0005-ComplexUpdate", new Script0005ComplexUpdate());

// Named after each instance's type full name, with ".cs" added
builder.WithScripts(new Script0005ComplexUpdate(), new Script0006UpdateInCode());

// Named by your own function
builder.WithScripts(s => s.GetType().Name, new Script0005ComplexUpdate());
```

See [Script providers](script-providers.md#embedded-sql-and-code-scripts-together) for the filter
options.
