---
title: Journaling
description: How DbBump records the scripts that have run, and how to change or replace the journal.
---

# Journaling

The journal records which scripts have run. Before an upgrade, DbBump reads the journal to work out
which scripts to skip. After each script runs, DbBump adds a record of it to the journal.

By default the journal is a table called `SchemaVersions` in the target database. The provider
creates it the first time it is needed, and keeps its structure up to date.

![The SchemaVersions table](/img/schema-versions.png)

Each row records a script's name and when it was applied.

## Changing the table name or schema

Providers have a method to change the schema and name of the journal table. For SQL Server:

```csharp
DeployChanges.To
    .SqlDatabase(connectionString)
    .JournalToSqlTable("MySchema", "MyTable")
    .Build();
```

Other providers have their own method, for example `JournalToPostgresqlTable`.

## NullJournal

`NullJournal` records nothing and reports that nothing has run. Every script it sees runs on every
upgrade.

Use it for scripts that are written to run again and again, such as scripts that drop and recreate
functions, views, procedures and permissions:

```csharp
DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(
        Assembly.GetExecutingAssembly(),
        s => s.Contains("everytime"))
    .JournalTo(new NullJournal())
    .Build();
```

A journal applies to the whole engine. To run some scripts every time while still journaling the
others, use the [`RunAlways` script type](../scripts/script-types.md) instead.

## Custom journal

Implement `IJournal` to store the record of scripts somewhere else:

```csharp
public interface IJournal
{
    string[] GetExecutedScripts();
    void StoreExecutedScript(SqlScript script, Func<IDbCommand> dbCommandFactory);
    void EnsureTableExistsAndIsLatestVersion(Func<IDbCommand> dbCommandFactory);
}
```

There are two ways to register one:

```csharp
// A journal instance. It does not take part in the upgrade's transactions.
builder.JournalTo(new MyJournal());

// A factory that receives the connection manager and log. A journal that uses the
// connection manager takes part in the upgrade's transactions.
builder.JournalTo((connectionManager, log) => new MyJournal(connectionManager, log));
```

To store the journal in a table with a different layout, derive from `TableJournal` in
`DbUp.Support`. It handles reading, writing and creating the table. You supply the SQL:

| Method | Returns |
|---|---|
| `CreateSchemaTableSql(string quotedPrimaryKeyName)` | SQL that creates the table. |
| `GetInsertJournalEntrySql(string scriptName, string applied)` | SQL that inserts a row, using the two parameter names given. |
| `GetJournalEntriesSql()` | SQL that selects the script names, in order. |

Override `OnTableCreated` to run more SQL after the table is created, or
`EnsureTableExistsAndIsLatestVersion` to migrate an older table layout.
