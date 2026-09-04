import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion";
import { useIsDark } from "@/lib/theme";
import { useAthenaAtFooter } from "@/lib/footer-athena";
import { subscribePulse } from "@/components/hero/reveal-timing";
import mascotDark from "@/assets/athena-agent.webp";
import mascotLight from "@/assets/athena-agent-light.webp";

/**
 * Her, uncovered at the end of the page.
 *
 * The homepage gives her a mechanism — the collision plane contracts into the
 * hole cut in her hands — and scenes to be present for. Neither exists on an
 * interior page: the plane there is flat, at half intensity, a backdrop with
 * prose over it, and a page of body copy has no empty section to hold her.
 *
 * So she is not staged here, she is *revealed*. She is pinned to the floor of
 * the window and the footer scrolls up off her, which means the page ends by
 * getting out of her way.
 *
 * Sticky rather than fixed, and that is the design rather than a preference.
 * Anything pinned to the bottom of the window is on the screen from the first
 * pixel of the document, and the sections of this site are translucent panels
 * by construction — `--panel-alpha` is 0.74 — so a fixed figure would ghost
 * through every one of them at a quarter strength the whole way down, which is
 * the wallpaper problem the homepage spent a week getting rid of. Sticky is
 * bounded by its containing block, and this one begins at the footer. Above it
 * she does not exist, so there is nothing to leak.
 *
 * The travel comes from `room`, a band after the footer for her to be revealed
 * *into*. Without it the sticky element has nowhere to slide and nothing
 * uncovers: the footer's background travels with the footer, so it can never
 * move off something inside it. That band is not padding — at the end of the
 * scroll it is the one part of any page where she is the whole picture.
 *
 * She is also the *last* thing in that container rather than the first, pulled
 * back over the room with a negative margin so she takes no space of her own.
 * That is not tidiness, it is the only arrangement that works: bottom-sticky
 * pulls a box **up** to keep it in view, it never pushes one down into empty
 * space. Written the obvious way round — her first, the room after — the clamp
 * against the top of the containing block forbids every shift and she simply
 * never moves. Measured: 59px, at every scroll position on the page.
 *
 * And the translucency that ruled out a fixed layer is what makes this one
 * work. She sits under the footer's panel at 0.74, so the same opacity is a
 * quarter strength behind the sitemap and full strength once it has gone. The
 * reveal needs no ramp, no scroll listener and no second value: it is the page
 * moving, not her.
 */

/** Where the sphere sits in the 1024² drawing. Shared with `CollisionReveal`. */
const SPHERE = { cx: 753 / 1024, cy: 749 / 1024, r: 135 / 1024 };

/**
 * How much of the window she is given, and where she stands in it.
 *
 * `band` is the strip of window she is drawn in, in pixels rather than a
 * fraction of anything: she is revealed against the bottom edge of the window,
 * and the window is the one thing here whose size is not known in advance.
 *
 * `figure` is the drawing inside it, and it is nearly twice the band on
 * purpose. At any size where the whole square fits, the whole square is a
 * four-hundred-pixel thumbnail and the engraving — the entire reason for using
 * this drawing rather than a silhouette — is gone. So she is drawn large and
 * the band crops her, which is what a crop is. `focus` is the fraction of the
 * drawing held at the middle of the band, and it sits between her face at 0.40
 * and the sphere at 0.75 rather than midway between them: the band is cut off
 * by the bottom of the window, so anything below centre is the half that gets
 * lost, and the sphere is the half that cannot be.
 *
 * `inset` takes her right edge off the screen, as a fraction of her own width,
 * so the empty corner of the square goes with it and her shoulder is against
 * the frame.
 *
 * `fade` dissolves the top of the band, and it is not optional. The drawing is
 * composed edge to edge — her plume starts sixteen pixels into a 1024 box — so
 * there is no height at which a crop containing the sphere does not also cut
 * her helmet, and a cut measured 42 of luminance across her brow in light mode,
 * a hard horizontal line the width of the figure. Dark mode hid it behind the
 * footer's own feather and light mode did not, which is the usual pattern: the
 * fix belongs at the edge, not in the theme.
 *
 * `room` matches the band, and that is arithmetic rather than taste. The travel
 * is the container less the band — footer + room - band — so setting the room
 * to the band makes the travel exactly the footer's own height, whatever that
 * turns out to be, and the footer ends up clear of her by exactly its own
 * height. Any less and part of her never comes out from under the sitemap.
 */
const FRAME = { band: 440, figure: 820, focus: 0.63, inset: 0.06, room: 440, fade: 120 };

/**
 * How present she is, per theme, and quieter than the homepage on both.
 *
 * Higher than the homepage's 0.46, and it has to be, because this is one value
 * doing two jobs. The footer's panel is over her at 0.74, so whatever is set
 * here reads at about a quarter of it behind the sitemap — the smallest type on
 * the site, and the one place a number that looked right in the open would sit
 * on top of a directory people actually use. Set for the exposed half of the
 * reveal and the panel takes care of the other.
 */
const PRESENCE = { dark: 0.52, light: 0.34 };

/**
 * The light in her hands.
 *
 * The drawing has the sphere cut to transparent — that is how the homepage
 * shows the live plane through it — so anywhere that does not contract a plane
 * into it, the hole shows whatever happens to be behind her. Here that is the
 * footer's own panel, which through a hundred-pixel hole is a grey disc. So the
 * hole is filled: a warm radial behind her, which is the ball she is plainly
 * holding.
 *
 * `spread` is a multiple of the sphere's diameter, generous so the halo reaches
 * her fingers and her jaw rather than stopping at the glass. `base` is what it
 * rests at, `swing` what a collision adds.
 */
const GLOW = { spread: 3.1, base: 0.5, swing: 0.5 };

/**
 * The glass, borrowed wholesale from the homepage's aperture.
 *
 * A warm radial alone is a light, not a ball — on black it passes because the
 * page is dark enough that a glow is all you would see anyway, and on paper it
 * came out as a flat peach disc with no edge. Screen blending cannot fix that:
 * over near-white it has nowhere to go. So the sphere gets the same two cues
 * the contracted one does — an edge that darkens because glass is thickest
 * where you look through the most of it, and a hairline of light just inside it
 * — drawn at the drawing's own sphere rather than at an aperture radius.
 */
const GLASS = { core: 0.58, rim: 0.42, lip: { at: 0.93, width: 0.06, level: 0.3 } };

/**
 * The same light again, landing on her rather than in the air.
 *
 * Masked by her own drawing, so it cannot touch the footer or the type over it,
 * which is what lets it be stronger and reach further than the halo. Without it
 * she is a flat watermark that happens to have a lamp beside her.
 */
const CAST = { reach: 0.85, base: 0.4, swing: 0.6 };

const FooterAthena = () => {
  const dark = useIsDark();
  const drawing = dark ? mascotDark : mascotLight;
  const show = useAthenaAtFooter();
  /* Only the light stops moving for a reduced-motion reader. She is a drawing,
     and a drawing is not motion — answering a request for less animation by
     deleting a picture would be answering a different question. */
  const [still] = useState(() => prefersReducedMotion());

  const pulse = useMotionValue(GLOW.base);
  const cast = useMotionValue(CAST.base);
  useEffect(() => {
    if (!show || still) return;
    /* The one thing tying her to the site's machinery, and worth the
       subscription: a figure holding a lamp that ignores the collisions going
       off behind her is two pictures on one page. */
    return subscribePulse((v) => {
      // The positive half only. The plane draws breath before an event, and a
      // lamp that dims in anticipation of a flash reads as a dropped frame.
      const up = v > 0 ? v : 0;
      pulse.set(GLOW.base + GLOW.swing * up);
      cast.set(CAST.base + CAST.swing * up);
    });
  }, [show, still, pulse, cast]);

  /* Read through a ref so a theme flip cannot rebuild the subscription; the
     next pulse picks the new value up. */
  const presence = useRef(PRESENCE.dark);
  presence.current = dark ? PRESENCE.dark : PRESENCE.light;
  const figure = useTransform(pulse, () => presence.current);

  if (!show) return null;

  const mask = {
    maskImage: `url(${drawing})`,
    maskSize: "100% 100%",
    WebkitMaskImage: `url(${drawing})`,
    WebkitMaskSize: "100% 100%",
  } as const;

  return (
    <>
      {/* The room, before her in the flow: it is what the container has that she
          does not fill, and therefore all of her travel. */}
      <div aria-hidden="true" style={{ height: FRAME.room }} />
      {/* And her, last, pulled back over it so she claims none of the page's
          height. Under the footer's panel, over the fixed plane — so once the
          sitemap has slid off she is standing in the collision rather than on a
          flat ground. */}
      <div
        className="pointer-events-none sticky bottom-0 z-0 overflow-hidden"
        style={{
          height: FRAME.band,
          marginTop: -FRAME.band,
          maskImage: `linear-gradient(to bottom, transparent 0, #000 ${FRAME.fade}px)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0, #000 ${FRAME.fade}px)`,
        }}
        aria-hidden="true"
      >
        <div
          className="absolute right-0 aspect-square"
          style={{
            height: FRAME.figure,
            top: FRAME.band / 2 - FRAME.focus * FRAME.figure,
            marginRight: -FRAME.inset * FRAME.figure,
          }}
        >
          {/* Under her, so it fills the hole cut in her hands and reads as the
              ball rather than as a light in front of one. See GLOW. */}
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
          {/* Over the halo and under her fingers, so it is the surface of the
              ball rather than a ring drawn on top of her hand. See GLASS. */}
          <div
            className="absolute"
            style={{
              left: `${SPHERE.cx * 100}%`,
              top: `${SPHERE.cy * 100}%`,
              width: `${SPHERE.r * 2 * 100}%`,
              aspectRatio: "1",
              translate: "-50% -50%",
              /* Or the box shows. A radial-gradient's last colour fills the
                 rest of its box, so the 42% black that draws the rim also
                 paints all four corners — invisible on the homepage, where a
                 clip-path is cutting a circle out of it anyway, and a plainly
                 visible 216px square here. */
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
          {/* Over her and masked to her, so the light she is holding lands on
              her and nowhere else. See CAST. */}
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
        </div>
      </div>
    </>
  );
};

export default FooterAthena;


