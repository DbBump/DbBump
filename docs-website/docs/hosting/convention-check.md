---
title: Embedded script check
description: Fail the build when a SQL script is not marked as an embedded resource.
---

# Embedded script check

A common mistake is to add a `.sql` file to the project and forget to set its build action to
**Embedded Resource**. The script is then not in the assembly, and DbBump never runs it.

## Embed every script by convention

In an SDK-style project, embed every script with a wildcard, so new files are embedded
automatically:

```xml
<ItemGroup>
  <EmbeddedResource Include="Scripts/**/*.sql" />
</ItemGroup>
```

## Fail the build when a script is not embedded

To be safe, add a target that fails the build if any `.sql` file is marked as `Content` or `None`:

```xml
<Target Name="CheckSqlScriptsAreEmbedded" BeforeTargets="Build">
  <Error Condition="'%(Content.Extension)' == '.sql'"
         Text="%(Content.Identity) is marked as Content. Mark SQL scripts as EmbeddedResource." />
  <Error Condition="'%(None.Extension)' == '.sql'"
         Text="%(None.Identity) is marked as None. Mark SQL scripts as EmbeddedResource." />
</Target>
```

## Older projects

Older, non-SDK projects can do the same in an `AfterBuild` target:

```xml
<Target Name="AfterBuild">
  <Message Text="@(Content)" Importance="high" Condition="%(Content.Extension) == '.sql'" />
  <Error Condition="%(Content.Extension) == '.sql'"
         Text="Nothing should be marked as Content, check your scripts are marked as Embedded Resource" />
</Target>
```

Older DbUp packages added this target for you with the Package Manager Console command
`Add-DbUpEmbeddedCheck -ProjectName SomeSolution.DataMigration`. That command relied on NuGet's
`install.ps1` scripts, which SDK-style projects and `PackageReference` do not run, and DbBump does
not ship it.

## Check at run time

You can also check when the program runs. `GetDiscoveredScripts()` returns every script the
providers found. If it is empty, the scripts were probably not embedded:

```csharp
if (upgrader.GetDiscoveredScripts().Count == 0)
{
    Console.Error.WriteLine("No scripts found. Are they marked as EmbeddedResource?");
    return -1;
}
```
