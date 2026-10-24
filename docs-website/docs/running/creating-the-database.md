---
title: Creating and dropping databases
description: Create the target database if it does not exist, or drop it, before running scripts.
---

# Creating and dropping databases

DbBump can create the target database before it runs your scripts. This is handy for local
development, for integration tests, and for the first deployment to a new environment.

## Create the database if it is missing

```csharp
EnsureDatabase.For.SqlDatabase(connectionString);

var upgrader = DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .LogToConsole()
    .Build();
```

`EnsureDatabase.For` connects to the server, checks whether the database in the connection string
exists, and creates it if it does not. If the database exists, it does nothing.

## Drop the database

```csharp
DropDatabase.For.SqlDatabase(connectionString);
```

This is useful in integration tests that need a clean database each run.

:::danger

`DropDatabase` deletes the database and all its data. Never point it at a connection string you
cannot afford to lose.

:::

## Which databases support this

`EnsureDatabase.For` and `DropDatabase.For` are entry points only. The methods on them, such as
`SqlDatabase` and `PostgresqlDatabase`, come from the provider packages. Not every provider supports
both. Check your provider's methods to see which it supplies.

Most overloads also take an `IUpgradeLog`, a command timeout, and options such as the collation or
an Azure database edition. Again, these depend on the provider.
