import { useEffect } from "react";

const SITE_NAME = "Athena Data Labs";
const ORIGIN = "https://athenadatalabs.com";
const DEFAULT_OG = `${ORIGIN}/og-image.png`;

type SeoProps = {
  /** Page title — the site name is appended automatically unless `bare` is set. */
  title: string;
  description: string;
  /** Path beginning with "/", e.g. "/products". Used for canonical + og:url. */
  path: string;
  /** OG/Twitter share image. Absolute URL or site-root path (e.g. "/og/about.png"). */
  image?: string;
  /** Accessible description of the share image; defaults to the page title. */
  imageAlt?: string;
  /** Set true on pages that should not be indexed (e.g. 404). */
  noindex?: boolean;
  /** If true, use `title` verbatim without appending the site name. */
  bare?: boolean;
  /** Open Graph type; use "article" for field notes and case studies. */
  ogType?: "website" | "article";
  /** Optional JSON-LD structured data injected as a script tag. */
  jsonLd?: Record<string, unknown>;
};

/** Find-or-create a tag identified by an attribute selector, then set its content/attrs. */
function upsert(
  selector: string,
  create: () => HTMLElement,
  apply: (el: HTMLElement) => void
) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  apply(el);
}

function setMetaByName(name: string, content: string) {
  upsert(
    `meta[name="${name}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute("name", name);
      return m;
    },
    (el) => el.setAttribute("content", content)
  );
}

function setMetaByProperty(property: string, content: string) {
  upsert(
    `meta[property="${property}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute("property", property);
      return m;
    },
    (el) => el.setAttribute("content", content)
  );
}

/**
 * Per-route document metadata, applied on mount: title, description, canonical
 * link, Open Graph / Twitter tags and the page's JSON-LD, updated whenever the
 * props change.
 *
 * Half of a pair. scripts/prerender.mjs reads these same values at build time
 * and bakes them into each route's HTML, which is what every client that never
 * runs JavaScript is served. This half covers what that one cannot: a route
 * reached by clicking rather than by loading, where no new document arrives and
 * the head would otherwise still describe the page the visitor came from.
 */
const Seo = ({ title, description, path, image = DEFAULT_OG, imageAlt, noindex = false, bare = false, ogType = "website", jsonLd }: SeoProps) => {
  // Serialized here rather than inside the effect so the dependency is the
  // graph's *contents*. Every caller builds this object inline in JSX, which
  // hands the effect a new reference on every render and had it rewriting the
  // whole head — title, twelve meta tags, canonical and the JSON-LD script —
  // on renders where not one value had changed.
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = bare ? title : `${title} | ${SITE_NAME}`;
    // Trailing slash on purpose. Amplify serves each route as a directory index
    // and 301s /about to /about/, so the slashless form is a URL that redirects
    // away from itself — advertising it as canonical contradicts the redirect.
    // The prerendered HTML and sitemap.xml name the same slashed form, so the
    // static and JS-rendered canonicals agree rather than overwriting each other.
    const url = `${ORIGIN}${path === "/" ? "/" : `${path.replace(/\/$/, "")}/`}`;
    const imageUrl = image.startsWith("http") ? image : `${ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
    const altText = imageAlt ?? fullTitle;

    document.title = fullTitle;
    setMetaByName("description", description);
    setMetaByName("robots", noindex ? "noindex, nofollow" : "index, follow");

    upsert(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        return l;
      },
      (el) => el.setAttribute("href", url)
    );

    setMetaByProperty("og:title", fullTitle);
    setMetaByProperty("og:description", description);
    setMetaByProperty("og:url", url);
    setMetaByProperty("og:site_name", SITE_NAME);
    setMetaByProperty("og:image", imageUrl);
    setMetaByProperty("og:image:secure_url", imageUrl);
    setMetaByProperty("og:image:width", "1200");
    setMetaByProperty("og:image:height", "630");
    setMetaByProperty("og:image:alt", altText);
    setMetaByProperty("og:type", ogType);
    setMetaByName("twitter:card", "summary_large_image");
    setMetaByName("twitter:title", fullTitle);
    setMetaByName("twitter:description", description);
    setMetaByName("twitter:image", imageUrl);
    setMetaByName("twitter:image:alt", altText);
  }, [title, description, path, image, imageAlt, noindex, bare, ogType]);

  // Structured data is rendered, not injected — the one part of this component
  // that has to exist without JavaScript.
  //
  // It used to be appended to <head> from the effect above, which meant the
  // SoftwareApplication, FAQPage and BreadcrumbList graphs describing every
  // product, service and article reached exactly one client: Googlebot. The
  // prerendered HTML carried the site-wide Organization block from index.html
  // and nothing else, so to Bing and to every AI retrieval crawler these pages
  // had no type, no price, no FAQ and no place in the site's hierarchy.
  //
  // In the tree, it is emitted by the build-time render into each route's file
  // and swapped by React on client navigation, which is what the effect was
  // doing by hand. schema.org markup is valid anywhere in the document.
  if (!jsonLdText) return null;
  return (
    <script
      type="application/ld+json"
      // Escaped because a "</script>" inside any string in the graph would
      // otherwise close this tag and spill the rest of the JSON into the page.
      dangerouslySetInnerHTML={{ __html: jsonLdText.replace(/</g, "\\u003c") }}
    />
  );
};

export const SITE_ORIGIN = ORIGIN;

export default Seo;
