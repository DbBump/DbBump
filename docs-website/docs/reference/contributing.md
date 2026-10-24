---
title: Contributing
description: How to report issues, build DbBump, run its tests and send a pull request.
---

# Contributing

Contributions are welcome: bug reports, fixes, features and improvements to these docs.

## Reporting an issue

Open an issue on [DbBump/DbBump](https://github.com/DbBump/DbBump/issues). Include the DbBump
version, the database and provider, and the smallest code or script that shows the problem.

## Sending a pull request

1. Find or open an issue for the change, and say you are working on it.
2. Fork the repository and create a branch from `main`.
3. Make the change, with tests.
4. Run the build and tests.
5. Open a pull request against `main`.

## Building

You need the .NET SDK. The solution is in `src/`:

```bash
dotnet build src/DbUp.sln
dotnet test src/DbUp.sln
```

### The DbBump NuGet feed

To build the providers, add the DbBump NuGet feed on your machine. Create a GitHub token with
`read:packages` access, then run:

```bash
dotnet nuget add source --name DbBump --username <YourUsername> --password <TheToken> https://nuget.pkg.github.com/DbBump/index.json
```

## Testing

DbUp and DbBump support many databases, so running every test against every real database is not
practical. The tests take a different approach:

- **`RecordingDbConnection`** keeps a log of every transaction opened, every command run, and the
  other things we care about. It is entirely in memory.
- **Approval tests**, using [Assent](https://github.com/droyad/Assent), compare that log with an
  approved copy.

This lets the tests exercise every feature for every database without touching a real database. It
does not test that the database driver is set up correctly and that commands really run against
that database. That is easy to test by hand, unlikely to break, and quickly reported and fixed when
it does.

The public API is also guarded by an approval test. If you change the public API on purpose, update
the approved file in the same pull request.

## Documentation

These docs are a [Docusaurus](https://docusaurus.io/) site in the `docs-website/` folder. Each page
has an **Edit this page** link at the bottom. To run the site locally:

```bash
cd docs-website
pnpm install
pnpm start
```

See `docs-website/README.md` for more.
