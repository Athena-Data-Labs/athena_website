---
name: verify
description: Build, serve, and visually verify this Vite + React SPA
---

# Verifying athena_website changes

Vite + React SPA (no SSR). Content pages are pure data in `src/content/*.ts`
rendered by components in `src/components/page/`.

## Build and serve

```bash
npm run build            # also regenerates public/sitemap.xml (lastmod dates change — expected)
npx vite preview --port 4179 &   # serves dist/
```

## Drive and capture

No Playwright package installed, but Playwright's headless Chromium is cached.
Screenshot any route with:

```bash
~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell \
  --headless --disable-gpu --screenshot=out.png \
  --window-size=1280,5200 --hide-scrollbars --virtual-time-budget=10000 \
  "http://localhost:4179/<route>"
```

- Tall pages: increase window height (page is captured at window size, not full-page).
- Mobile check: `--window-size=390,9000`.
- Crop regions with `sips -c <h> <w> --cropOffset <y> <x> in.png --out crop.png`.

## Gotchas

- Routes worth checking for content edits: `/resources/case-studies/<slug>`,
  `/resources/insights/<slug>`, `/products/<slug>`.
- `npm run build` includes typegen/sitemap; a content typo fails the build, so
  a green build already covers typecheck.
