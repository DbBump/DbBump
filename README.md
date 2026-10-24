# DbBump

DbBump is a fork of [DbUp](https://github.com/DbUp/DbUp). The goal of this fork is to work through DbUp's open issues and
pull requests: review them, triage them, fix them and merge them in.

Issues for this fork are tracked at [DbBump/DbBump](https://github.com/DbBump/DbBump/issues). The DbUp sections below
still describe the upstream project.

# About DbUp

DbUp is a set of .NET libraries that helps you to deploy changes to different databases like SQL Server. It tracks which
SQL scripts have been run already, and runs the change scripts that are needed to get your database up to date.

# Documentation

To learn more about DbUp check out the [documentation](https://dbup.readthedocs.io/en/latest/).

# Status

| Package     | Build                                                                                                                                                                   | Downloads                                                                                         | Latest Stable                                                                                    | Latest Prerelease                                                                                   | Issues                                                                                                   | Pull Requests                                                                                              |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| DbBump-Core | [![GitHub Actions](https://img.shields.io/github/actions/workflow/status/DbBump/DbBump/main.yml?branch=main)](https://github.com/DbBump/DbBump/actions/workflows/main.yml) | [![NuGet](https://img.shields.io/nuget/dt/dbbump-core.svg)](https://www.nuget.org/packages/dbbump-core) | [![NuGet](https://img.shields.io/nuget/v/dbbump-core.svg)](https://www.nuget.org/packages/dbbump-core) | [![NuGet](https://img.shields.io/nuget/vpre/dbbump-core.svg)](https://www.nuget.org/packages/dbbump-core) | [![view](https://img.shields.io/github/issues/DbBump/DbBump)](https://github.com/DbBump/DbBump/issues) | [![view](https://img.shields.io/github/issues-pr/DbBump/DbBump)](https://github.com/DbBump/DbBump/pulls) |

# Extensions by the community

Maintenance and support for the extensions where not provided by the DbUp project. For questions and support on
these extensions, please contact the project directly.

## CLI

[https://github.com/drewburlingame/dbup-cli](https://github.com/drewburlingame/dbup-cli)

A dotnet tool that install all sql scripts from the specified folders. A simple configuration model provides the knobs to control how the scripts are applied. The only code that needs to be written is sql.

## DbUpX.Reborn (Previously DbUpX)

[https://github.com/mthpbs/DbUpX](https://github.com/mthpbs/DbUpX)

Extensions to DbUp supporting easy filtering, ordering and versioning:

- a journaling system that stores hashes of script contents, so we know if they need to rerun,
- a concept of "dependency comments" in scripts that let you more easily control the ordering of scripts,
- protection against code reorganisation affecting long script names,
- utilities for sorting and filtering scripts in helpful ways.

## DbUp.Extensions

[https://github.com/twenzel/DbUp.Extensions](https://github.com/twenzel/DbUp.Extensions)

Extensions to DbUp supporting versioning and script providers:

- a journaling system that stores hashes of script contents, so we know if they need to rerun,
- a script provider for reading Liquibase changelog files

# Contributing

## NuGet Feed

To build the providers, you will need to add the DbBump NuGet feed to your local machine. Do this by generating
a GitHub token with `read:package` access and running:

```
dotnet nuget add source --name DbBump --username <YourUsername> --password <TheToken> https://nuget.pkg.github.com/DbBump/index.json
```
