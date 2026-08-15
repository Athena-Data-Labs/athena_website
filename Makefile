SHELL := /bin/bash

# pnpm, because that is what actually builds this site: amplify.yml pins
# pnpm@9.12.3 and installs from pnpm-lock.yaml. These targets used npm, which
# resolves its own tree from its own lockfile — so a local `make install` could
# hand you a different dependency graph than the one in production, and nothing
# would say so. One package manager, one lockfile.
.PHONY: install dev build preview lint test clean

install:
	pnpm install

dev:
	VITE_DASHBOARD_URL=$${VITE_DASHBOARD_URL:-https://aegis.athenadatalabs.com} VITE_ALLOW_LOCAL_DASHBOARD=$${VITE_ALLOW_LOCAL_DASHBOARD:-false} pnpm run dev -- --host localhost

build:
	pnpm run build

preview:
	pnpm run build && pnpm run preview -- --host localhost

lint:
	pnpm run lint

test:
	pnpm run test

clean:
	rm -rf dist
