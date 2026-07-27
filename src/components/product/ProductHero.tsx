import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { Product, ProductLink } from "@/content";
import { contentIcons, productImages } from "@/components/content-icons";
import appStoreBadge from "@/assets/download-on-the-app-store-en-us/white.svg";

/**
 * The product page hero.
 *
 * This used to be a slim breadcrumb strip on an opaque panel, with the product's
 * name buried inside its showcase card — so a product page opened flatter than
 * every other page on the site. Now it is a transparent window onto the shared
 * atmosphere plane, the same treatment PageShell gives interior pages, with the
 * product's own icon carrying the watermark instead of a Greek word.
 */

const ease = [0.21, 0.47, 0.32, 0.98] as const;

/** Staggered rise, in the order a reader takes the block in. */
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease },
});

/** The oversized, near-invisible product mark behind the title block. */
const Watermark = ({ product }: { product: Product }) => {
  const img = productImages[product.icon];
  const Icon = contentIcons[product.icon];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-12 top-4 select-none md:right-4 md:top-0"
    >
      {img ? (
        <img
          src={img}
          alt=""
          className="h-[280px] w-[280px] object-contain opacity-[0.055] md:h-[380px] md:w-[380px]"
          style={{
            maskImage: "radial-gradient(closest-side, #000 35%, transparent 92%)",
            WebkitMaskImage: "radial-gradient(closest-side, #000 35%, transparent 92%)",
          }}
          decoding="async"
        />
      ) : (
        Icon && (
          <Icon
            className="h-[260px] w-[260px] text-steel/[0.07] md:h-[340px] md:w-[340px]"
            strokeWidth={0.5}
          />
        )
      )}
    </div>
  );
};

/** Renders one CTA in the shape its `kind` asks for. */
const HeroLink = ({ link }: { link: ProductLink }) => {
  const external = link.href.startsWith("http");

  if (link.kind === "appstore") {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event={link.umamiEvent}
        aria-label={link.label}
        className="inline-flex transition-opacity hover:opacity-80"
      >
        <img src={appStoreBadge} alt={link.label} className="h-[50px] w-auto" decoding="async" />
      </a>
    );
  }

  const primary = link.kind === "primary";
  const className = primary
    ? "group inline-flex items-center gap-2 bg-primary px-7 py-[15px] text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
    : "group inline-flex items-center gap-2 border border-white/15 px-7 py-[15px] text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-steel/50 hover:text-steel";

  const inner = (
    <>
      {link.label}
      {external ? (
        <ExternalLink size={14} />
      ) : (
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event={link.umamiEvent}
        className={className}
      >
        {inner}
      </a>
    );
  }

  // A same-page anchor has to stay a plain link: routing it would push "#id"
  // as a path and land on the 404.
  if (link.href.startsWith("#")) {
    return (
      <a href={link.href} data-umami-event={link.umamiEvent} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link to={link.href} data-umami-event={link.umamiEvent} className={className}>
      {inner}
    </Link>
  );
};

/* Stacked hairlines on phones, where two columns need the separation. On
   desktop the four columns are set apart by the gap alone: full-height rules
   between them turned a four-fact rail into a cramped table, and they stretched
   raggedly whenever one value wrapped to a second line. */
const Spec = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-white/[0.06] py-4 pr-6 md:border-b-0 md:pr-0">
    <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{label}</dt>
    <dd className="mt-1.5 text-sm leading-snug text-foreground/90">{value}</dd>
  </div>
);

const ProductHero = ({ product }: { product: Product }) => {
  const live = !product.comingSoon;

  return (
    <header
      id="product-hero"
      className="relative overflow-hidden bg-transparent pb-10 pt-28 md:pb-12 md:pt-32"
    >
      <Watermark product={product} />

      <div className="container relative mx-auto px-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-steel"
        >
          <ArrowLeft size={14} /> All Products
        </Link>

        <motion.p
          {...rise(0.05)}
          className="mt-8 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60"
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            {live && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-steel/70 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live ? "bg-steel" : "bg-primary"}`}
            />
          </span>
          {product.tag}
        </motion.p>

        <motion.h1
          {...rise(0.1)}
          className="mt-4 font-display text-5xl font-black leading-[0.98] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl"
        >
          {product.name}
        </motion.h1>

        <motion.p
          {...rise(0.16)}
          className="mt-3 font-display text-xl font-semibold tracking-tight text-gradient md:text-2xl"
        >
          {product.tagline}
        </motion.p>

        <motion.div {...rise(0.2)} className="mt-6 h-px w-24 bg-steel/40" />

        <motion.p
          {...rise(0.24)}
          className="mt-6 max-w-2xl text-base leading-[1.75] text-slate-100/90 md:text-lg"
        >
          {product.summary}
        </motion.p>

        {product.links.length > 0 && (
          <motion.div {...rise(0.3)} className="mt-8 flex flex-wrap items-center gap-3">
            {product.links.map((link) => (
              <HeroLink key={link.label} link={link} />
            ))}
          </motion.div>
        )}

        {/* The four facts a buyer checks before reading anything else. Status is
            not among them: the eyebrow above already carries it. Left transparent
            on purpose — the rail is a window onto the same plane as the rest of
            the header, divided by hairlines rather than boxed. */}
        <motion.dl
          {...rise(0.36)}
          className="mt-10 grid max-w-3xl grid-cols-2 border-t border-white/[0.08] md:grid-cols-4 md:gap-x-10"
        >
          <Spec label="Price" value={product.priceLabel ?? "On request"} />
          <Spec label="Platform" value={product.hosting.platform} />
          <Spec label="Built with" value={product.technologies.slice(0, 2).join(" · ")} />
          <Spec label="Runs on" value={product.hosting.runsOn} />
        </motion.dl>
      </div>
    </header>
  );
};

export default ProductHero;
