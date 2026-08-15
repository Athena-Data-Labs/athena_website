# Localhost Testing Guide

This guide shows how to run the Athena website locally for development and QA.

## Requirements

- Node.js 18+
- pnpm 9 (`npm install -g pnpm@9.12.3`) — the same version `amplify.yml` builds with,
  and the one `pnpm-lock.yaml` is written for. Installing with a different package
  manager resolves a different dependency graph than production without telling you.
- GNU Make (preinstalled on most macOS systems)

## Quick Start

From the project root:

```sh
make install
make dev
```

Then open:

```text
http://localhost:5173
```

## Make Targets

- `make install` - install dependencies
- `make dev` - run Vite dev server on localhost
- `make build` - create production build
- `make preview` - preview production build on localhost
- `make lint` - run ESLint
- `make test` - run tests
- `make clean` - remove build output

## Environment Variables

The website reads `VITE_DASHBOARD_URL` for the link into **Aegis BI** (the app).

By default, localhost URLs (like `http://localhost:8080`) are ignored for safety and the site falls back to the production Aegis BI URL.
To intentionally use a local app URL, set `VITE_ALLOW_LOCAL_DASHBOARD=true`.

Example:

```sh
VITE_DASHBOARD_URL=https://aegis.athenadatalabs.com make dev
```

Use local dashboard app explicitly:

```sh
VITE_DASHBOARD_URL=http://localhost:8080 VITE_ALLOW_LOCAL_DASHBOARD=true make dev
```

## Troubleshooting

If dependencies fail to install:

```sh
rm -rf node_modules
make install
```

Leave `pnpm-lock.yaml` in place — it is the file Amplify builds from, and deleting
it turns a reinstall into a re-resolve.

If port 5173 is busy:

```sh
pnpm run dev -- --port 4173
```
