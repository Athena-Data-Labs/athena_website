import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { markServedPrerendered } from "./lib/stage";
import "./index.css";

const container = document.getElementById("root")!;

// The build writes each route's rendered HTML into this element so that
// crawlers which never run JavaScript are served the actual page. Note it
// before mounting, because createRoot is about to empty the element and the
// evidence goes with it — the preloader needs to know whether the visitor has
// already been looking at the site while this bundle downloaded.
//
// createRoot rather than hydrateRoot, deliberately. The static markup is a
// crawler's copy and a faster first paint, not a hydration target: the server
// tree has no cursor, no WebGL and no session storage, so it renders the
// stage-ready state while the client starts from the opposite one. Hydrating
// across that would mean reconciling a mismatch on every load; discarding it
// costs one render of markup the browser has already painted.
if (container.firstElementChild) markServedPrerendered();

createRoot(container).render(<App />);
