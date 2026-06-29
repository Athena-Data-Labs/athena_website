SHELL := /bin/bash

.PHONY: install dev build preview lint test clean

install:
	npm install

dev:
	VITE_DASHBOARD_URL=$${VITE_DASHBOARD_URL:-https://aegis.athenadatalabs.com} VITE_ALLOW_LOCAL_DASHBOARD=$${VITE_ALLOW_LOCAL_DASHBOARD:-false} npm run dev -- --host localhost

build:
	npm run build

preview:
	npm run build && npm run preview -- --host localhost

lint:
	npm run lint

test:
	npm run test

clean:
	rm -rf dist
