import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getProduct } from "@/content";

/**
 * The fourth cell of the homepage product grid: the three shipped apps, one at
 * a time, actually on screen.
 *
 * The homepage argues that four things are in production and then shows a
 * reader nothing but type. The screens exist — every product page already runs
 * them — so the cheapest honest fix is to lift one into the grid rather than
 * ask anyone to click through on faith.
 *
 * It sits in the cell ANN Builder Studio used to hold. ANN is a browser
 * demonstration rather than a product someone buys, so it was the one card of
 * the four not doing the section's job, and it keeps its place on /products.
 *
 * The window is fixed at 16:10, which the two desktop captures already are.
 * MyBudgetNerd is a phone at 0.46, and letterboxing one into a landscape frame
 * left it 82px wide — present, unreadable, and looking like a mistake. So the
 * phone slide is a composed still instead: three App Store screens side by
 * side on a transparent ground, packed to fill the same frame. Regenerate it
 * from src/assets/mbn/ if those screens are ever recut.
 */
type Slide = {
  slug: string;
  /** What the screen is showing, not what the product is — the name is beside it. */
  caption: string;
  /** One source, or [light, dark] where the product ships both. */
  src: string | [string, string];
};

const slides: Slide[] = [
  { slug: "aegis", caption: "Command center", src: "/aegis-dashboard.webp" },
  { slug: "thera", caption: "Capture pipeline", src: ["/thera-capture-light.webp", "/thera-capture-dark.webp"] },
  { slug: "mybudgetnerd", caption: "Review, forecast, explain", src: "/mbn-home-preview.webp" },
];

const ROTATE_MS = 4200;

const Art = ({ slide, name }: { slide: Slide; name: string }) => {
  const alt = `${name}: ${slide.caption.toLowerCase()}`;
  const cls = "absolute inset-0 h-full w-full object-contain";
  if (typeof slide.src === "string") {
    return <img src={slide.src} alt={alt} loading="lazy" decoding="async" className={cls} />;
  }
  const [light, dark] = slide.src;
  return (
    <>
      <img src={light} alt={alt} loading="lazy" decoding="async" className={`${cls} dark:hidden`} />
      <img src={dark} alt="" loading="lazy" decoding="async" className={`${cls} hidden dark:block`} />
    </>
  );
};

const HomeProductPreview = () => {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    // A carousel that moves while someone is reading it is a carousel that
    // loses them. Hover, focus and reduced-motion all stop it.
    if (held) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((p) => (p + 1) % slides.length), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [held]);

  const slide = slides[i];
  const product = getProduct(slide.slug);
  if (!product) return null;

  return (
    <div
      className="flex h-full flex-col bg-background"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      {/* Full-bleed to the cell edges: inset by the card's padding this would
          be a thumbnail, and a thumbnail of a dashboard is unreadable. */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-foreground/[0.04]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Art slide={slide} name={product.name} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col p-7 pt-6">
        <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55">
          <span className="h-3 w-[2px] shrink-0 bg-steel" />
          Live Preview
        </p>

        {/* Fixed height: the three names and captions are different lengths, and
            without it the whole grid row twitches every four seconds. */}
        <div className="mt-3 h-[3.4rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.slug}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
                {product.name}
              </h3>
              <p className="mt-1 text-sm leading-[1.5] text-muted-foreground">{slide.caption}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Show ${getProduct(s.slug)?.name ?? s.slug}`}
                aria-current={idx === i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx === i ? "bg-steel" : "bg-foreground/25 hover:bg-foreground/50"
                }`}
              />
            ))}
          </div>
          <Link
            to={`/products/${slide.slug}`}
            data-umami-event="home-preview-open"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/60 transition-colors hover:text-steel"
          >
            See It Running
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeProductPreview;
