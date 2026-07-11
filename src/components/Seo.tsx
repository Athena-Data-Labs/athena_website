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
  /** Open Graph type; use "article" for insights and case studies. */
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
 * Per-route document metadata for this client-rendered SPA. Updates the title,
 * description, canonical link, and Open Graph / Twitter tags on mount and whenever
 * the props change, so each route reports its own SEO data to JS-aware crawlers.
 */
const Seo = ({ title, description, path, image = DEFAULT_OG, imageAlt, noindex = false, bare = false, ogType = "website", jsonLd }: SeoProps) => {
  useEffect(() => {
    const fullTitle = bare ? title : `${title} | ${SITE_NAME}`;
    const url = `${ORIGIN}${path}`;
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

    // Per-page structured data. One managed script tag, replaced on route change.
    const existing = document.getElementById("page-jsonld");
    if (jsonLd) {
      const script = existing ?? document.createElement("script");
      script.id = "page-jsonld";
      script.setAttribute("type", "application/ld+json");
      script.textContent = JSON.stringify(jsonLd);
      if (!existing) document.head.appendChild(script);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, path, image, imageAlt, noindex, bare, ogType, jsonLd]);

  return null;
};

export const SITE_ORIGIN = ORIGIN;

export default Seo;
