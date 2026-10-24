# DbBump documentation site

The DbBump documentation site, built with [Docusaurus](https://docusaurus.io/).
Published to GitHub Pages at <https://dbbump.github.io/DbBump/>.

## Local development

This project uses [pnpm](https://pnpm.io/). The version is pinned by the
`packageManager` field in [`package.json`](package.json), so `corepack enable` is
enough to get the right one.

```sh
pnpm install
pnpm start
```

`pnpm start` serves the site at <http://localhost:3000/DbBump/> with hot reload.

## Build

```sh
pnpm run build      # static output in ./build
pnpm run serve      # serve the built output locally
pnpm run typecheck  # type check the config and sidebars
```

The build fails on a broken link, a broken anchor or a broken Markdown link, so a page that
links to a heading that was renamed is caught before it is published.

## Content

Documentation pages live in [`docs/`](docs) as Markdown. Ordering is controlled by
[`sidebars.ts`](sidebars.ts). Images live in [`static/img`](static/img) and are linked as
`/img/<name>.png`.

The site runs in **docs-only mode**: `docs/overview.md` has `slug: /` and is served
as the site root, so there is no separate landing page under `src/pages`.

The [API reference](docs/api) is written by hand from the public API of `src/dbup-core`. When a
pull request changes the public API (and so the approved file
`src/dbup-tests/ApprovalFiles/NoPublicApiChanges.Run.approved.cs`), update the matching page.

## Publishing

[`.github/workflows/docs.yml`](../.github/workflows/docs.yml) builds the site on pull requests
that touch `docs-website/`, and builds and deploys it on every push to `main` that touches it.
Pull requests build the site (and type check) without deploying.

One-time repository setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
