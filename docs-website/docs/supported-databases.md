---
title: Supported databases
description: The databases DbBump and DbUp support, and the state of the DbBump provider packages.
---

# Supported databases

The core library does not talk to any particular database. A provider package adds the builder
method that targets a database, and supplies the journal table and the rules for that database's
SQL.

DbUp has providers for these databases:

| Database | Builder method | Upstream package |
|---|---|---|
| SQL Server 2000 and later, and Azure SQL | `SqlDatabase` | `dbup-sqlserver` |
| PostgreSQL | `PostgresqlDatabase` | `dbup-postgresql` |
| MySQL | `MySqlDatabase` | `dbup-mysql` |
| SQLite | `SQLiteDatabase` | `dbup-sqlite` |
| Firebird | `FirebirdDatabase` | `dbup-firebird` |
| Oracle | `OracleDatabase` | `dbup-oracle` |
| Amazon Redshift | `RedshiftDatabase` | `dbup-redshift` |

SQL Server uses `Microsoft.Data.SqlClient`. MySQL uses `MySqlConnector`.

## DbBump provider packages

:::info Work in progress

DbBump publishes `dbbump-core`. The provider packages have not been forked yet. Each upstream
provider depends on the upstream `dbup-core` package, so it does not yet work with `dbbump-core`.
Follow progress, or ask for a provider, on the
[DbBump issue tracker](https://github.com/DbBump/DbBump/issues).

:::

## Writing your own provider

A provider is a set of extension methods on `SupportedDatabases` that configure an
`UpgradeEngineBuilder`. It usually supplies:

- an `IConnectionManager`, often derived from `DatabaseConnectionManager`, that opens connections
  and splits scripts into commands;
- an `IScriptExecutor`, usually derived from `ScriptExecutor`;
- an `IJournal`, usually derived from `TableJournal`;
- an `ISqlObjectParser` that quotes object names.

See [Extensibility](api/extensibility.md) for the interfaces. If you want to add a database to
DbBump, see [Contributing](reference/contributing.md).
