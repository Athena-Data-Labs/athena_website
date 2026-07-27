import { Component, type ErrorInfo, type ReactNode } from "react";
import { CHUNK_ERROR, recoverFromStaleChunk } from "@/lib/stale-chunk";

/**
 * Catches route-level failures so one bad chunk cannot take the site down.
 *
 * Without a boundary here, a rejected `React.lazy` import unmounts the whole
 * tree and leaves a blank page. A stale deploy gets one automatic reload (see
 * `stale-chunk`); anything else gets a page a human can act on.
 */

type Props = { children: ReactNode };
type State = { failed: boolean };

class RouteBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (CHUNK_ERROR.test(error.message) && recoverFromStaleChunk()) return;
    // Anything else is a genuine bug; leave it in the console for whoever looks.
    console.error("Route failed to render", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="flex min-h-screen items-center bg-[#0a0c10] pt-16">
        <div className="container mx-auto px-6 py-20">
          <span className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/55">
            <span className="h-3.5 w-[2px] shrink-0 bg-steel" />
            Something Broke
          </span>
          <h1 className="mt-5 font-display text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">
            This page failed to load
          </h1>
          <div className="mt-5 h-px w-24 bg-steel/40" />
          <p className="mt-5 max-w-xl text-base leading-[1.72] text-muted-foreground">
            Usually a stale copy of the site left over from an older visit. Reloading fetches a
            fresh one and should clear it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-primary px-7 py-[15px] text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Reload the Page
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 border border-white/15 px-7 py-[15px] text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-steel/50 hover:text-steel"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }
}

export default RouteBoundary;
