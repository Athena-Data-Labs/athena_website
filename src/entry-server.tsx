import { Writable } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppProviders, Shell } from "./App";

/**
 * The build-time half of the site.
 *
 * This app is client-rendered, which meant every URL was served the same shell
 * with `<div id="root"></div>` and nothing inside it. Google runs JavaScript
 * and saw the real pages; nothing else does. Bing, DuckDuckGo, LinkedIn's
 * unfurler and every AI retrieval crawler — the ones behind "what software does
 * X" in ChatGPT, Perplexity and Claude — read the HTML once, without executing
 * anything, and got a title and an empty div. Twenty-one content pages, five
 * hundred paragraphs of writing, and none of it existed to any of them.
 *
 * scripts/prerender.mjs already wrote a real file per route to give social
 * scrapers their own Open Graph tags. This renders the page body into those
 * same files, so what ships is HTML with the words in it.
 *
 * `renderToPipeableStream` with `onAllReady`, not `renderToString`, and that is
 * the whole reason this file is a stream: every route in App.tsx is `lazy()`,
 * and several pages lazy-load their own sections again inside. `renderToString`
 * cannot wait for a promise, so it would emit the Suspense fallback — a blank
 * `min-h-screen` div — for every one of them, which is the bug it was meant to
 * fix, shipped one layer deeper. `onAllReady` fires once every boundary in the
 * tree has resolved, so what comes out is the finished page.
 */

/** Long enough for the deepest lazy tree, short enough to fail a CI build. */
const RENDER_TIMEOUT_MS = 20_000;

export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const errors: unknown[] = [];
    let settled = false;

    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const { pipe, abort } = renderToPipeableStream(
      <AppProviders>
        <StaticRouter location={url}>
          <Shell />
        </StaticRouter>
      </AppProviders>,
      {
        onAllReady() {
          if (settled) return;

          // React recovers from a thrown component by rendering a fallback and
          // carrying on, so a page can fail and still "succeed" here. A build
          // that quietly swaps a broken page for a blank div is the failure
          // this whole file exists to prevent, so any error is fatal.
          if (errors.length) {
            fail(errors[0]);
            return;
          }

          let html = "";
          pipe(
            new Writable({
              write(chunk, _encoding, callback) {
                html += chunk.toString("utf8");
                callback();
              },
              final(callback) {
                settled = true;
                resolve(html);
                callback();
              },
            }),
          );
        },
        onError(error) {
          errors.push(error);
        },
      },
    );

    const timer = setTimeout(() => {
      abort();
      fail(new Error(`render timed out after ${RENDER_TIMEOUT_MS}ms: ${url}`));
    }, RENDER_TIMEOUT_MS);
    timer.unref?.();
  });
}
