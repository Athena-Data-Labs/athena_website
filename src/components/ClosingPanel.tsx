import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prefersReducedMotion } from "@/lib/motion";
import { useIsDark } from "@/lib/theme";
import { subscribePulse } from "@/components/hero/reveal-timing";
import { certificationAbbrs, SBA_VERIFY_URL } from "@/content";
import { useMascotWholePlate } from "@/lib/mascot";
import logo from "@/assets/logo.webp";
import logoLight from "@/assets/logo-light.webp";

/**
 * How an interior page ends: a full screen that was underneath it all along.
 *
 * The homepage gives her a mechanism — the collision plane contracts into the
 * hole cut in her hands — and scenes to be present for. Interior pages have
 * neither: the plane there is flat, at half intensity, a backdrop with prose
 * over it, and a page of body copy has no empty section to hold her. So the
 * ending is not a section she appears in. It is a layer the page is lying on
 * top of, uncovered as the last screen scrolls away.
 *
 * This replaces the sitemap footer on these pages rather than sitting under it.
 * The first version put her below the footer and it read badly for a reason
 * worth writing down: the footer slid up and left a figure standing in an empty
 * band with nothing else in it. A reveal has to uncover a *composition*, not a
 * picture — so what is underneath is the whole closing screen, mark and
 * wordmark and the two ways further into the site, with her in it.
 *
 * Everything the footer was legally carrying comes with it: the entity name,
 * the certifications and their verification link. What does not is the four
 * columns of sitemap links, which the top navigation carries on every page.
 */

/**
 * The reveal, and why it is a clip rather than anything cheaper.
 *
 * The layer is `fixed`, because that is the only way for the page to slide off
 * something that does not itself move. Fixed means it is behind the whole
 * document, though, and the sections of this site are translucent panels by
 * construction — and one of them, the consultation band, is a fully transparent
 * window onto the plane. Left alone, the closing screen would be visible
 * through that band in the middle of every page.
 *
 * So it is masked to the room below the page, at whatever height that block
 * currently starts on screen. Above that line the panel is not painted at all
 * and the plane shows through the windows exactly as it did before; below it,
 * the panel is what is there. Geometric rather than a fade, which is what makes
 * it read as uncovering rather than appearing.
 *
 * A mask rather than a `clip-path`, for the last hundred and forty pixels of
 * it. A clip is a knife, and the edge it leaves does not always land on
 * anything: the consultation band above is a transparent window, so the cut
 * arrived in mid-air as a hairline across the plane with different tone on
 * either side of it. Feathered, it dissolves — which is the same argument
 * `.panel` makes for its own outer edges, and one property doing both jobs.
 *
 * The feather is `min(FEATHER, top)` rather than a constant, or the top of the
 * panel would still be fading at the end of the scroll, when `top` is zero and
 * there is nothing left above it to fade into. It closes as the panel lands.
 */
const ROOM_VH = 100;
const FEATHER = 140;

/**
 * How tall she is drawn, as a fraction of the window.
 *
 * Set from her crest rather than by eye. The drawing's ink starts 1.9% of the
 * way down its box, so at a height h her plume reaches `100 - 0.981h` percent
 * from the top of the screen, and the type above her runs to about 38%. Sixty
 * four hundredths puts the crest exactly there, and drops the orb — which sits
 * at 0.449 of the drawing — to 65% down, clear of every line of copy.
 */
const FIGURE_VH = 64;

/** Where the sphere sits in the plate, from the pipeline's own cut. */
const SPHERE = { cx: 420.5 / 2048, cy: 920.5 / 2048, r: 189.5 / 2048 };

/** How present she is, per theme. The panel is hers, so this is not shy. */
const PRESENCE = { dark: 0.62, light: 0.4 };

/**
 * The light in her hands, and the glass around it.
 *
 * The halo is thrown *by* the sphere onto the page around her, so it is drawn
 * under the figure and reaches well past the sphere's own edge.
 */
const GLOW = { spread: 3.2, base: 0.5, swing: 0.45 };
/**
 * The sphere as a source rather than as a pigment.
 *
 * This panel used to draw the ball itself, because the plate it used had the
 * sphere cut to transparent for the homepage's benefit and something had to
 * fill the hole. A radial gradient is a poor substitute and looked it: a flat
 * disc, no surface, none of the concentric hatching or the hot off-centre core
 * the drawing has. Nothing here needs the hole — there is no plane to contract
 * into it — so this panel takes the uncut plate and the sphere is simply drawn.
 *
 * What the drawing cannot supply is emission. Ink can be gold; it cannot be
 * brighter than the paper. So one screen-blended warm gradient sits over the
 * drawn sphere, hot where the drawing's own core is and gone by its rim, and it
 * carries the pulse — which is what ties the ball to the halo and the cast, and
 * makes the three read as one light rather than three effects at one place.
 */
const EMIT = { level: 0.8, at: [42, 38], reach: 88 };
const CAST = { reach: 0.9, base: 0.42, swing: 0.58 };
const GLASS = { core: 0.62, rim: 0.24, lip: { at: 0.93, width: 0.06, level: 0.22 } };

/** The breakpoint below which she is not drawn — or fetched. */
const WIDE = "(min-width: 1024px)";

const ClosingPanel = () => {
  const dark = useIsDark();
  const drawing = useMascotWholePlate(dark);
  const room = useRef<HTMLDivElement>(null);
  const veil = useMotionValue("linear-gradient(to bottom, transparent, transparent)");

  /*
   * Her drawing is gated on width and the clip is not.
   *
   * `display: none` hides a picture; it does not call off the fetch, and this
   * one is a quarter of a megabyte. Read synchronously at mount so no paint
   * lands on the wrong side of the answer, and watched afterwards because a
   * window is a thing people drag. The panel itself — type, buttons, mark —
   * costs nothing and is the page's ending at every size.
   */
  const [wide, setWide] = useState(
    () => typeof window === "undefined" || window.matchMedia(WIDE).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  /* Only the light stops moving for a reduced-motion reader. A drawing is not
     motion, and neither is a page ending. */
  const [still] = useState(() => prefersReducedMotion());

  /*
   * Where the page currently ends, published to the clip.
   *
   * A passive coalesced listener with a self-retiring frame loop, the same
   * shape the reveal on the homepage uses: `getBoundingClientRect` is a read,
   * the write is one style property, and the loop stops the moment the value
   * stops changing. No observer, because this needs the exact number every
   * frame of a scroll rather than a threshold crossing.
   */
  useEffect(() => {
    let frame = 0;
    const apply = () => {
      const el = room.current;
      if (!el) return;
      const vh = window.innerHeight;
      const top = Math.min(vh, Math.max(0, el.getBoundingClientRect().top));
      const fade = Math.min(FEATHER, top);
      veil.set(
        `linear-gradient(to bottom, transparent ${top.toFixed(1)}px, #000 ${(
          top + fade
        ).toFixed(1)}px)`,
      );
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [veil]);

  const pulse = useMotionValue(GLOW.base);
  const cast = useMotionValue(CAST.base);
  useEffect(() => {
    if (!wide || still) return;
    /* The one thing tying her to the site's machinery, and worth the
       subscription: a figure holding a lamp that ignores the collisions going
       off behind her is two pictures on one page. */
    return subscribePulse((v) => {
      // The positive half only. The plane draws breath before an event, and a
      // lamp that dims just before a flash reads as a dropped frame.
      const up = v > 0 ? v : 0;
      pulse.set(GLOW.base + GLOW.swing * up);
      cast.set(CAST.base + CAST.swing * up);
    });
  }, [wide, still, pulse, cast]);

  /* Read through a ref so a theme flip cannot rebuild the subscription. */
  const presence = useRef(PRESENCE.dark);
  presence.current = dark ? PRESENCE.dark : PRESENCE.light;
  const figure = useTransform(pulse, () => presence.current);

  const mask = {
    maskImage: `url(${drawing})`,
    maskSize: "100% 100%",
    WebkitMaskImage: `url(${drawing})`,
    WebkitMaskSize: "100% 100%",
  } as const;

  return (
    <>
      {/* The room. In flow, so the document actually has somewhere to end, and
          carrying the id because the plane watches its windows by element — a
          fixed panel would measure as permanently on screen and the field would
          never throttle again on these pages. */}
      <div
        id="closing-panel"
        ref={room}
        aria-hidden="true"
        style={{ height: `${ROOM_VH}vh` }}
      />

      <motion.section
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ maskImage: veil, WebkitMaskImage: veil }}
        aria-label="Athena Data Labs"
      >
        {/* The wordmark, enormous and ghosted, behind everything. It is the
            same two words as the type above it, which is the point: at this
            size it is a texture and a signature rather than a second reading. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[24%] select-none text-center font-display text-[12vw] font-black leading-[0.86] tracking-[-0.04em] text-foreground/[0.028]"
          aria-hidden="true"
        >
          ATHENA
          <br />
          DATA LABS
        </div>

        {wide && (
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 aspect-square -translate-x-1/2"
            style={{ height: `${FIGURE_VH}vh` }}
            aria-hidden="true"
          >
            {/* The light the sphere throws on the page behind her. Under the
                figure, so her hand and her arm cut into it. See GLOW. */}
            <motion.div
              className="absolute mix-blend-screen"
              style={{
                left: `${SPHERE.cx * 100}%`,
                top: `${SPHERE.cy * 100}%`,
                width: `${SPHERE.r * 2 * GLOW.spread * 100}%`,
                aspectRatio: "1",
                translateX: "-50%",
                translateY: "-50%",
                opacity: pulse,
                background:
                  "radial-gradient(circle, hsl(var(--field-warm) / 0.9) 0%, hsl(var(--field-warm) / 0.3) 30%, transparent 70%)",
              }}
            />
            <motion.img
              src={drawing}
              alt=""
              width={2048}
              height={2048}
              loading="lazy"
              decoding="async"
              {...{ fetchpriority: "low" }}
              className="relative block h-full w-full max-w-none"
              style={{ opacity: figure }}
            />
            {/* Masked to her, so the light she is holding lands on her and
                nowhere else. See CAST. */}
            <motion.div
              className="absolute inset-0 mix-blend-screen"
              style={{
                opacity: cast,
                backgroundImage: `radial-gradient(ellipse ${CAST.reach * 100}% ${
                  CAST.reach * 100
                }% at ${SPHERE.cx * 100}% ${
                  SPHERE.cy * 100
                }%, hsl(var(--field-warm) / 0.55) 0%, hsl(var(--field-warm) / 0.22) 24%, rgba(0,0,0,0) 86%)`,
                ...mask,
              }}
            />
            {/* The sphere lit, over the drawing of it. Clipped to a circle
                because a radial-gradient's last colour fills the rest of its
                box. See EMIT. */}
            <motion.div
              className="absolute mix-blend-screen"
              style={{
                left: `${SPHERE.cx * 100}%`,
                top: `${SPHERE.cy * 100}%`,
                width: `${SPHERE.r * 2 * 100}%`,
                aspectRatio: "1",
                translate: "-50% -50%",
                borderRadius: "50%",
                opacity: pulse,
                background: `radial-gradient(circle at ${EMIT.at[0]}% ${
                  EMIT.at[1]
                }%, rgba(255,249,232,${EMIT.level}) 0%, hsl(var(--field-warm) / ${
                  EMIT.level * 0.8
                }) 34%, hsl(var(--field-warm) / ${
                  EMIT.level * 0.34
                }) 72%, rgba(0,0,0,0) ${EMIT.reach}%)`,
              }}
            />
            {/* The surface of the ball, over it. Clipped to a circle
                because a radial-gradient's last colour fills the rest of its
                box, so the rim's black would otherwise paint all four corners.
                See GLASS. */}
            <div
              className="absolute"
              style={{
                left: `${SPHERE.cx * 100}%`,
                top: `${SPHERE.cy * 100}%`,
                width: `${SPHERE.r * 2 * 100}%`,
                aspectRatio: "1",
                translate: "-50% -50%",
                borderRadius: "50%",
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0) ${
                  (GLASS.lip.at - GLASS.lip.width) * 100
                }%, rgba(255,255,255,${GLASS.lip.level}) ${
                  GLASS.lip.at * 100
                }%, rgba(255,255,255,0) ${
                  (GLASS.lip.at + GLASS.lip.width) * 100
                }%), radial-gradient(circle, rgba(0,0,0,0) ${
                  GLASS.core * 100
                }%, rgba(0,0,0,${GLASS.rim}) 100%)`,
              }}
            />
          </div>
        )}

        {/* The type. `pointer-events-auto` only from here down: the panel is a
            fixed layer over the whole window and must not eat clicks on the
            page above it, but the two links in it have to work. */}
        <div className="pointer-events-none absolute inset-x-0 top-[12%] px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground/55">
            Decision Intelligence Systems
          </p>
          <p className="mt-5 font-display text-4xl font-black leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            <span className="text-gradient">Athena Data Labs</span>
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Designed, built, shipped, and run by us.
          </p>
          <div className="pointer-events-auto mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="hero" className="group" asChild>
              <Link to="/products" data-umami-event="closing-products">
                See All Products
                <ArrowRight
                  className="ml-1 transition-transform group-hover:translate-x-1"
                  size={16}
                />
              </Link>
            </Button>
            <Button variant="heroOutline" asChild>
              <Link to="/services" data-umami-event="closing-services">
                See All Services
              </Link>
            </Button>
          </div>
        </div>

        {/* The meta rows, where the footer's legal line used to be. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-6 pb-6 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 sm:px-10">
          <p className="max-w-[16rem] leading-relaxed">
            © 2026 Athena Data Labs
            <br />
            A division of Athena Analytics L.L.C.
          </p>
          <div className="flex flex-col items-end gap-3">
            {/* Two drawings, CSS picks — see Navbar and ProductMark. */}
            <span className="block h-9 w-9">
              <img
                src={logoLight}
                alt=""
                className="h-9 w-9 object-contain dark:hidden"
                loading="lazy"
                decoding="async"
              />
              <img
                src={logo}
                alt=""
                className="hidden h-9 w-9 object-contain dark:block"
                loading="lazy"
                decoding="async"
              />
            </span>
            <a
              href={SBA_VERIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto transition-colors hover:text-steel"
            >
              {certificationAbbrs} · SBA-Certified
            </a>
          </div>
        </div>
      </motion.section>
    </>
  );
};

export default ClosingPanel;
