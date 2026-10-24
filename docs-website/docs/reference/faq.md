---
title: FAQ
description: Answers to common questions about DbBump.
---

# FAQ

## I changed a script, but DbBump did not run it again. Why?

The journal records a script's name, not its contents. Once a script has run, DbBump skips it, even
if its contents change. Write a new script for the new change. See
[How it works](../how-it-works.md#script-names-matter).

## DbBump ran all my scripts again. Why?

The script names changed, so DbBump saw them as new scripts. This happens when you:

- rename a script;
- move embedded scripts to another folder, or change the project's root namespace or assembly name,
  because both are part of an embedded resource's name;
- move a file script into a subfolder, because the folder is part of its name.

Use `GetExecutedButNotDiscoveredScripts()` to find the old names. To keep the new names, use a
[custom script name comparer](../scripts/ordering-and-filtering.md#comparing-script-names) that
treats the old and new names as the same.

## DbBump does not find my scripts.

If they are embedded, check that each `.sql` file's build action is **Embedded Resource**. See
[Embedded script check](../hosting/convention-check.md). If you pass a filter to
`WithScriptsEmbeddedInAssembly`, it replaces the default `.sql` rule, so check that your filter
accepts the full resource name, such as `MyApp.Scripts.Script0001.sql`.

## My scripts run in the wrong order.

Names are compared as text, character by character, so `Script10.sql` comes before `Script2.sql`.
Pad the numbers with zeros, or use a date and time prefix. See
[Ordering and filtering](../scripts/ordering-and-filtering.md).

## Can I roll back a failed upgrade?

Yes, if your database supports transactional DDL. Use `WithTransaction()` to run the whole upgrade
in one transaction. See [Transactions](../running/transactions.md).

## Can I downgrade a database?

No. See [Schema downgrading](schema-downgrading.md).

## A script contains `$` signs and fails with "Variable ... has no value defined".

DbBump treats text between two `$` signs as a variable. Turn substitution off with
`WithVariablesDisabled()`. See [Variable substitution](../scripts/variable-substitution.md).

## A long script times out.

Set a longer command timeout with `WithExecutionTimeout`. See [Timeouts](../running/timeouts.md).

## How is DbBump different from DbUp?

DbBump is a fork of DbUp that works through DbUp's backlog of issues and pull requests. The API and
namespaces are the same. See [History](history.md).

## My question is not here.

Ask on the [issue tracker](https://github.com/DbBump/DbBump/issues). Pull requests that add
answers to this page are welcome.
