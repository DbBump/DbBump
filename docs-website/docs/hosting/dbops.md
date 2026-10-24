---
title: DBOps PowerShell module
description: DBOps is a PowerShell module built on DbUp for CI/CD database deployments.
---

# DBOps PowerShell module

[DBOps](https://github.com/sqlcollaborative/dbops/) is a PowerShell module built on DbUp. It adds
continuous integration and continuous deployment features for SQL database deployments. Its
functions make DbUp simpler to use from PowerShell. As well as many ways to configure and deploy
scripts, it can put scripts into ready-to-deploy packages that become artifacts in your deployment
pipeline. You can deploy these packages in a simple, repeatable way.

:::note

DBOps is a separate community project. It bundles the upstream DbUp libraries, not DbBump.

:::

DBOps supports:

- SQL Server
- Oracle
- PostgreSQL
- MySQL

## Features

- Deploy your scripts in a consistent, repeatable way.
- Run ad-hoc deployments with many deployment options.
- Run ad-hoc queries against any supported database on Windows and Linux.
- Create a versioned, ready-to-deploy package with one command.
- CI/CD pipeline features: builds, artifact management, deployment.
- DbUp's transaction management and schema versioning.
- Change your code with custom variables, using `#{customVarName}` tokens.

## System requirements

- PowerShell 5.0 or later

## Installation

### From the PowerShell Gallery

```powershell
Install-Module dbops
```

### With git

If you use git, also install the modules it depends on (see below):

```powershell
git clone https://github.com/sqlcollaborative/dbops.git dbops
Import-Module .\dbops
```

### Module dependencies

- [PSFramework](https://github.com/PowershellFrameworkCollective/psframework)
- [ZipHelper](https://www.powershellgallery.com/packages/ziphelper), only if you run the module's
  tests

## Use cases

- Ad-hoc deployments of any size, without running code by hand.
- Delivering a new version of the database schema to many environments in the same way.
- Build, test and deploy steps in a CI/CD pipeline.
- Deployments based on the files that changed in the source folder.
- Versioned package deployments, for example with Octopus Deploy.

## Getting started

### Deploy scripts and run queries

```powershell
# Ad-hoc deployment of the scripts in the folder myscripts
Install-DBOSqlScript -ScriptPath C:\temp\myscripts -SqlInstance server1 -Database MyDB

# Run a list of files as an ad-hoc query
Get-ChildItem C:\temp\myscripts | Invoke-DBOQuery -SqlInstance server1 -Database MyDB
```

### Packages

A package is an artifact for your CI/CD pipeline. It is a ready-to-deploy zip file that contains
the database scripts, the deployment configuration and the module itself.

![DBOps packages](https://sqlcollaborative.github.io/dbops/img/dbops-package.jpg)

A package holds one or more builds. When you deploy it, each script in each build runs once, in the
right order.

DBOps packages work with Octopus Deploy: each has a `deploy.ps1` file that starts the deployment.

```powershell
# Deploy using a package
New-DBOPackage Deploy.zip -ScriptPath C:\temp\myscripts | Install-DBOPackage -SqlInstance server1 -Database MyDB

# Create a package with predefined configuration, then deploy it, replacing #{dbName} tokens
New-DBOPackage -Path MyPackage.zip -ScriptPath .\Scripts -Configuration @{ Database = '#{dbName}'; ConnectionTimeout = 5 }
Install-DBOPackage MyPackage.zip -Variables @{ dbName = 'myDB' }

# Add builds to the package
Add-DBOBuild Deploy.zip -ScriptPath .\myscripts -Type Unique -Build 2.0
Get-ChildItem .\myscripts | Add-DBOBuild Deploy.zip -Type New,Modified -Build 3.0

# Install the package with its own Deploy.ps1, which is useful when the module is not installed
Expand-Archive Deploy.zip '.\MyTempFolder'
.\MyTempFolder\Deploy.ps1 -SqlInstance server1 -Database MyDB
```

### Configuration and defaults

You can configure DBOps with default settings, with parameters at run time, or with configuration
files:

```powershell
# Store deployment options in the package, so it can deploy without them
Update-DBOConfig Deploy.zip -Configuration @{ DeploymentMethod = 'SingleTransaction'; SqlInstance = 'localhost'; Database = 'MyDb2' }
Install-DBOPackage Deploy.zip

# Create configuration files and use them later as deployment templates
New-DBOConfig -Configuration @{ DeploymentMethod = 'SingleTransaction'; SqlInstance = 'devInstance'; Database = 'MyDB' } | Export-DBOConfig '.\dev.json'
Get-DBOConfig -Path '.\dev.json' -Configuration @{ SqlInstance = 'prodInstance' } | Export-DBOConfig '.\prod.json'
# Deploy a package
Install-DBOPackage Deploy.zip -ConfigurationFile .\dev.json
# Deploy scripts
Install-DBOSqlScript .\MyScripts*.sql -ConfigurationFile .\prod.json

# Deploy a package with a custom connection string
Install-DBOPackage -Path Deploy.zip -ConnectionString 'Server=myServerAddress;Database=myDataBase;Trusted_Connection=True;'

# Deploy a package to the Oracle database OracleDB
Install-DBOPackage -Path Deploy.zip -Server OracleDB -ConnectionType Oracle

# List all the default settings
Get-DBODefaultSetting

# Set the default SchemaVersionTable to null, which turns off journaling by default
Set-DBODefaultSetting -Name SchemaVersionTable -Value $null

# Reset SchemaVersionTable to its default value
Reset-DBODefaultSetting -Name SchemaVersionTable
```

### CI/CD

The DBOps CI/CD flow builds each package version once and deploys it to every environment.
Successful builds go into artifact storage. The next iteration pulls the package from there and adds
new builds to it.

![The DBOps CI/CD flow](https://sqlcollaborative.github.io/dbops/img/ci-cd-flow.jpg)

```powershell
# Build MyPackage.zip from the scripts in .\Scripts.
# Each run picks up only the new files in the ScriptPath folder.
Invoke-DBOPackageCI -Path MyPackage.zip -ScriptPath .\Scripts -Version 1.0

# Store the package in a DBOps package repository in the folder \\data\repo
Publish-DBOPackageArtifact -Path myPackage.zip -Repository \\data\repo

# Get the latest package version from the repository and install it
Get-DBOPackageArtifact -Path myPackage.zip -Repository \\data\repo | Install-DBOPackage -Server MyDBServer -Database MyDB
```

## More information

See [DBOps on GitHub](https://github.com/sqlcollaborative/dbops/).
