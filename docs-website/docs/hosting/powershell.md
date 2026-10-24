---
title: PowerShell
description: Call DbBump directly from a PowerShell script.
---

# PowerShell

You can call DbBump directly from PowerShell. This is useful in a deployment tool such as Octopus
Deploy, where a PowerShell step is easier to set up than a separate executable.

PowerShell cannot call extension methods as methods, so call them as static methods on their
classes. The builder methods in the core library are on `StandardExtensions`. The database methods
are on a class in the provider.

```powershell
$databaseName   = $args[0]
$databaseServer = $args[1]
$scriptPath     = $args[2]

Add-Type -Path 'x:\location\of\dbbump-core.dll'
Add-Type -Path 'x:\location\of\dbup-sqlserver.dll'

$connectionString = "server=$databaseServer;database=$databaseName;Trusted_Connection=Yes;Connection Timeout=120;"

$dbUp = [DbUp.DeployChanges]::To
$dbUp = [SqlServerExtensions]::SqlDatabase($dbUp, $connectionString)
$dbUp = [StandardExtensions]::WithScriptsFromFileSystem($dbUp, $scriptPath)
$dbUp = [SqlServerExtensions]::JournalToSqlTable($dbUp, 'MySchema', 'MyTable')
$dbUp = [StandardExtensions]::LogToConsole($dbUp)

$upgradeResult = $dbUp.Build().PerformUpgrade()

if (-not $upgradeResult.Successful) {
    Write-Error $upgradeResult.Error
    exit 1
}
```

`dbbump-core.dll` is the core assembly. The provider assembly name depends on the provider. Load
every assembly the provider depends on too, such as `Microsoft.Data.SqlClient.dll`.

For a PowerShell-first experience with packaging and configuration files, see
[DBOps](dbops.md).
