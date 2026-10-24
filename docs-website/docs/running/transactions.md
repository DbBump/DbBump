---
title: Transactions
description: Run scripts without a transaction, in one transaction per script, or in one transaction for the whole upgrade.
---

# Transactions

DbBump can run your scripts inside transactions, so a failed upgrade can be rolled back. There are
four modes:

| Builder method | `TransactionMode` | Behaviour |
|---|---|---|
| `WithoutTransaction()` | `NoTransaction` | **The default.** No transaction. Each script that succeeds stays applied, even if a later script fails. |
| `WithTransactionPerScript()` | `TransactionPerScript` | Each script runs in its own transaction. A failing script is rolled back. The scripts before it stay applied. |
| `WithTransaction()` | `SingleTransaction` | The whole upgrade runs in one transaction. If any script fails, every script is rolled back. |
| `WithTransactionAlwaysRollback()` | `SingleTransactionAlwaysRollback` | One transaction for the whole upgrade, which is always rolled back, even on success. Use it to test that scripts run without changing the database. |

```csharp
DeployChanges.To
    .SqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .WithTransaction()
    .LogToConsole()
    .Build();
```

The journal record for a script is written in the same transaction as the script, so the journal
and the database stay in step.

## What can run in a transaction

Not every statement can run in a transaction, and databases differ a lot here. MySQL, for example,
commits implicitly before and after most DDL statements, so a transaction gives little protection.
Some SQL Server statements, such as `CREATE DATABASE` and `ALTER DATABASE`, cannot run in a
transaction at all.

For details, see:

- [Transactional DDL in PostgreSQL: a competitive analysis](https://wiki.postgresql.org/wiki/Transactional_DDL_in_PostgreSQL:_A_Competitive_Analysis),
  which compares many popular databases
- [SQL Server transactions: limitations and restrictions](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transactions-sql-data-warehouse#limitations-and-restrictions)
- [MySQL statements that cause an implicit commit](https://dev.mysql.com/doc/refman/8.0/en/implicit-commit.html)
