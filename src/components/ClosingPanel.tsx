import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
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
 * Where the ball sits in the plate, and how big it is — the pipeline's own
 * reading of its ink line, not of its silhouette.
 *
 * The homepage's constant is a different number for a different job: there it
 * is the hole the collision shows through, cut wide enough to clear the ball.
 * Here everything drawn is drawn *on* the ball, and being flush is the point.
 */
const BALL = { cx: 420.5 / 2048, cy: 912.5 / 2048, r: 167.5 / 2048 };

/** How present she is, per theme. The panel is hers, so this is not shy. */
const PRESENCE = { dark: 0.62, light: 0.4 };

/**
 * The light in her hands, and the glass around it.
 *
 * The halo is thrown *by* the sphere onto the page around her, so it is drawn
 * under the figure and reaches well past the sphere's own edge.
 *
 * Its falloff has to be smooth the whole way out, and the first version was not
 * — which read as a second sphere drawn around the first. Two stops did it. The
 * gradient's radius is `spread` sphere radii, so the stop at 30% sat within a
 * pixel of the sphere's own rim: the halo went from bright to a third of that
 * across exactly the line where the sphere ends, and the eye takes a change of
 * slope on a circle as an edge. Then it faded to nothing by 70%, which drew a
 * second circle out in the open where the light simply stopped.
 *
 * So the stops are a decay rather than a shape: convex, no knee at the rim, and
 * reaching zero only at the edge of its own box, where there is nothing left to
 * terminate. The percentages below are of that box, and `RIM` is where the
 * sphere ends in it — named, so the one place the curve must *not* do anything
 * interesting is visible in the numbers.
 */
const GLOW = { spread: 3.6, base: 0.5, swing: 0.45 };
/** Where the sphere's own edge falls in the halo gradient, as a percentage. */
const RIM = 100 / GLOW.spread;
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
const EMIT = { level: 0.9, at: [42, 38], reach: 100 };
const CAST = { reach: 0.9, base: 0.42, swing: 0.58 };
const GLASS = { core: 0.34, rim: 0.5, lip: { at: 0.93, width: 0.06, level: 0.16 } };

/**
 * How she is framed, which is a different picture on a phone.
 *
 * On a wide screen it is 64vh, set from her crest rather than by eye: the
 * drawing's ink starts 1.9% of the way down its box, so at a height h her plume
 * reaches `100 - 0.981h` percent from the top of the screen, and the type above
 * her runs to about 38%. Sixty four hundredths puts the crest exactly there,
 * and drops the ball — at 0.445 of the drawing — to 65% down, clear of every
 * line of copy.
 *
 * A square viewport-tall box centres her with room on both sides, and on a
 * 390-pixel screen that box is wider than the screen — so the only way to keep
 * the whole drawing is to make it small, and small is the one thing this
 * drawing cannot survive. The hatching is the point of it.
 *
 * So a phone gets a *crop* rather than a reduction: the box is wider than the
 * window and she is cut by its edges, the same way the bottom of the frame
 * already cuts her on every screen. `118vw` is measured off the plate's own
 * content, which spans 0.053 to 0.882 of its width — at that size the drawing's
 * left edge lands a hair inside the screen and the empty margin on its right
 * hangs off, which is what puts her and the ball where the eye is rather than
 * where the file happens to be centred. The `7vw` is the same measurement from
 * the other end: the ball sits at 0.205 of the plate and is 0.082 across, so
 * centred it lands with its left edge two pixels off the screen — shifted, it
 * clears with its glow.
 *
 * Bounded by height as well, because a short phone in the hand is a real thing
 * and the type above her has to keep its room: at 56vh her crest reached the
 * second link on a 667-pixel screen, and 52 clears it on every size checked.
 *
 * The sideways shift is the phone's alone. By 768 pixels the box is height-
 * bound rather than width-bound, so there is room on both sides again and
 * moving her off centre only makes the frame lopsided.
 */
const FIGURE_BOX = "h-[min(118vw,52vh)] lg:h-[64vh]";

/** `FIGURE_BOX` in pixels, for the plate-size decision. Kept beside it. */
const figureBox = () => {
  if (typeof window === "undefined") return 900;
  const { innerWidth: w, innerHeight: h } = window;
  return w >= 1024 ? h * 0.64 : Math.min(w * 1.18, h * 0.52);
};

/** The corner mark. Two drawings, CSS picks — see Navbar and ProductMark. */
const Mark = ({ className = "" }: { className?: string }) => (
  <span className={`block h-9 w-9 ${className}`}>
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
);

const ClosingPanel = () => {
  const dark = useIsDark();
  const drawing = useMascotWholePlate(dark, figureBox());
  const room = useRef<HTMLDivElement>(null);
  const veil = useMotionValue("linear-gradient(to bottom, transparent, transparent)");

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
    if (still) return;
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
  }, [still, pulse, cast]);

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
        <div
          className={`pointer-events-none absolute bottom-0 left-1/2 ml-[7vw] aspect-square -translate-x-1/2 md:ml-0 ${FIGURE_BOX}`}
          aria-hidden="true"
        >
            {/* The light the sphere throws on the page behind her. Under the
                figure, so her hand and her arm cut into it. See GLOW. */}
            <motion.div
              className="absolute mix-blend-screen"
              style={{
                left: `${BALL.cx * 100}%`,
                top: `${BALL.cy * 100}%`,
                width: `${BALL.r * 2 * GLOW.spread * 100}%`,
                aspectRatio: "1",
                translateX: "-50%",
                translateY: "-50%",
                opacity: pulse,
                background: `radial-gradient(circle, hsl(var(--field-warm) / 0.95) 0%, hsl(var(--field-warm) / 0.85) ${(
                  RIM * 0.6
                ).toFixed(1)}%, hsl(var(--field-warm) / 0.72) ${RIM.toFixed(
                  1,
                )}%, hsl(var(--field-warm) / 0.34) ${(RIM * 1.5).toFixed(
                  1,
                )}%, hsl(var(--field-warm) / 0.12) ${(RIM * 2.1).toFixed(
                  1,
                )}%, hsl(var(--field-warm) / 0.03) ${(RIM * 2.6).toFixed(
                  1,
                )}%, rgba(0,0,0,0) 100%)`,
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
                }% at ${BALL.cx * 100}% ${
                  BALL.cy * 100
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
                left: `${BALL.cx * 100}%`,
                top: `${BALL.cy * 100}%`,
                width: `${BALL.r * 2 * 100}%`,
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
                left: `${BALL.cx * 100}%`,
                top: `${BALL.cy * 100}%`,
                width: `${BALL.r * 2 * 100}%`,
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
          {/* Two ruled links rather than two buttons.
              A filled button is the heaviest mark this design system has, and
              on this screen it was competing with the one thing that is
              supposed to be brightest — she is holding a light, and a solid
              amber block six inches from it flattens the whole composition.
              They are also not a primary and a secondary: products and
              services are the two halves of the same company and the panel is
              offering both, so a filled button beside an outlined one was
              making a claim about them that nothing else on the site makes.
              Ruled, they read as two doors, and the light stays the subject.
              No arrow, either: a rule under a word already says the word is a
              way through, and the arrow was a second sign for the same thing —
              on this screen, next to a figure and a light, it read as
              decoration rather than as direction.
              The padding is on the link and the rule is on the text inside it,
              so the tap target is 36 pixels tall while the underline stays
              tight to the words. */}
          <div className="pointer-events-auto mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10">
            {[
              { to: "/products", label: "See all products", ev: "closing-products" },
              { to: "/services", label: "See all services", ev: "closing-services" },
            ].map((door) => (
              <Link
                key={door.to}
                to={door.to}
                data-umami-event={door.ev}
                className="group inline-flex items-center py-2 font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/75 transition-colors hover:text-foreground"
              >
                <span className="border-b border-foreground/25 pb-1 transition-colors group-hover:border-primary/80">
                  {door.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* On a phone she is cropped large enough to stand behind the legal
            line, which then sits on her forearm and is the one thing here that
            has to stay readable. The plate's own bottom fade is not enough — it
            is drawn for a figure running off the foot of the frame, not for
            type laid over her. A short scrim reads as the light falling off her
            and gives the line its page back. She never reaches it on a wide
            screen, so it is not drawn there. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/80 to-transparent lg:hidden"
          aria-hidden="true"
        />

        {/* The meta rows, where the footer's legal line used to be. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-6 pb-6 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70 sm:px-10">
          <div className="flex flex-col gap-3">
            {/* The mark sits over her on a phone, where she is cropped large
                and stands right of centre — two helmets three inches apart,
                and the small one loses. On the left it has the one corner of
                this screen she is not in. */}
            <Mark className="lg:hidden" />
            <p className="max-w-[16rem] leading-relaxed">
              © 2026 Athena Data Labs
              <br />
              A division of Athena Analytics L.L.C.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Mark className="hidden lg:block" />
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
