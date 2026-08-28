import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { THERA_URL } from "@/lib/dashboard";
import { scrollToTop } from "@/lib/scroll";
import { DUR, EASE } from "@/lib/motion";
import logo from "@/assets/logo.webp";

type NavItem = {
  label: string;
  route: string;
  /** Set where the label is a proper name the row should not shout over. */
  keepCase?: boolean;
};

const navItems: NavItem[] = [
  { label: "Services", route: "/services" },
  { label: "Products", route: "/products" },
  { label: "Resources", route: "/resources" },
  { label: "Aletheia", route: "/aletheia" },
  { label: "About", route: "/about" },
  // The audience for this one arrives looking for it by category, not by our
  // name for it, so the nav says what it is rather than what we called the
  // page. "GovCon" is what this market calls itself — primes and capture teams
  // read it instantly — and it is short enough for a row with no width left to
  // spend. The footer link carries the full "Capability Statement" wording for
  // anyone who does not know the shorthand.
  { label: "GovCon", route: "/government", keepCase: true },
  { label: "Contact", route: "/contact" },
];

/* Horizontal counterpart of the vertical accent bar used in section eyebrows.
   Two different marks share the slot:

   The hover mark scales in from the left, and belongs to the link it is under.

   The active mark is a single element that *moves*. Every active underline in
   the row carries the same layoutId, so when the route changes framer sees one
   element that has changed position rather than two that appeared and
   vanished, and slides it across the row. It costs nothing — the tab that lost
   it and the tab that gained it both render the same span — and it is the
   detail that reads as considered: the row has one indicator with a history,
   instead of a light going out here and another coming on there.

   Declared out here rather than inside Navbar, which is where it started. A
   component defined in another component's body is a *new component type* on
   every render, so React cannot reconcile it — it tears the old one down and
   mounts a fresh one each time the navbar re-renders, which is every time the
   bar condenses or the route changes. Those are precisely the moments the
   shared-layout animation is supposed to be running, and a remounted element
   has no previous position to animate from. */
const Underline = ({ active, shared = true }: { active: boolean; shared?: boolean }) => {
  if (active && shared) {
    return (
      <motion.span
        layoutId="nav-underline"
        className="absolute -bottom-0.5 left-0 h-[2px] w-full bg-primary"
        /* A spring, and specifically not the tween this had first, because the
           target it is sliding toward is moving while it slides.

           A route change usually also returns the page to the top, which takes
           the bar out of its condensed state — and that runs a 500ms font-size
           transition on all seven tabs. Every tab is therefore changing width
           and position underneath an animation whose whole job is to land
           exactly on one of them. A fixed-duration tween solves for the target
           it was given on frame one and has to correct at the end when that
           target has moved, which is precisely the roughness you see in the
           last few pixels. A spring re-solves continuously and simply arrives.

           0.7s so it outlasts the 500ms resize: by the time the underline is
           settling, the thing it is settling onto has stopped moving. Zero
           bounce because an indicator that overshoots and comes back is
           reporting something that did not happen. */
        transition={{ type: "spring", duration: 0.7, bounce: 0 }}
      />
    );
  }
  return (
    <span
      className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-primary transition-transform ease-calm ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const lastPath = useRef<string | null>(null);
  const navSettled = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  /* Two things ride the scroll position rather than a boolean.

     The bar's own surface is the first: rather than switching from transparent
     to blurred at a threshold — a visible click, and the thing that gives a
     fixed header away as a widget — the surface ramps in as you scroll.

     The first version ramped the *blur* from 0 to 16px along with the opacity,
     and it was invisible. Measuring it says why, and the answer is that it had
     the effect exactly backwards.

     Blur is not a thing you see. It is a thing you see *through*. It shows
     only where there is structure behind it to soften, and the one stretch of
     this site with real structure directly under the bar is the top of the
     homepage, where the field throws hard-edged shards across the header. A
     blur that starts at zero is at its least glass-like precisely there: those
     shards cut straight through the bar as sharp diagonals, which does not
     read as transparency, it reads as the bar not being drawn. At 24px the
     same shards become a soft luminous wash and the bar becomes a pane of
     glass with something happening behind it.

     So the blur is constant and full strength from the first pixel, and the
     opacity is the only thing that rides the scroll: glass at the top of a
     page, near-solid by the time body text is passing underneath, which is
     when the reader needs the bar to be a surface rather than a window. A
     fixed radius is also the cheaper of the two — the compositor keeps its
     blur pipeline instead of rebuilding it for a new radius every frame.

     0.45 is a floor, not a taste. Measured against the rendered pixels of each
     tab over the homepage hero, the worst label ("About", which sits under the
     brightest shard) reads 4.08:1 against a fully transparent bar and 5.0:1 at
     0.45 — the difference between failing WCAG AA on the primary navigation
     and clearing it with margin on an animated backdrop.

     Written to a CSS custom property instead of inline style so a media query
     can decide whether to use it at all: below lg the bar stays opaque,
     because a backdrop filter over a phone's column of body text is both
     unreadable and the most expensive thing on the page. */
  const { scrollY, scrollYProgress } = useScroll();
  const navAlpha = useTransform(scrollY, [0, 420], [0.45, 0.92], { clamp: true });

  /* The second is the read-position hairline along the bottom edge. It used to
     be a component two long pages opted into; there is no page where "how much
     of this is left" is not worth two pixels, and the bar is where it belongs —
     pinned to the bottom edge of the thing that is already pinned. The spring
     is doing one job: a raw scroll value tracks a trackpad's jitter exactly,
     and the eye reads that as cheap. */
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 32,
    mass: 0.5,
    restDelta: 0.001,
  });

  // Every link closes the menu itself, but the back button changes the route
  // without going through one — and left the menu sitting open over the page
  // you had just returned to.
  useEffect(() => setMobileOpen(false), [location.pathname]);

  /* A route change lands at the top of the new page — every layout on this site
     scrolls there on mount — but that mount happens a few hundred milliseconds
     after the click, behind the route cross-fade. So the bar was doing its work
     twice.

     Traced across a real navigation from a scrolled page: the active underline
     slid to the new tab and settled by 350ms, sat perfectly still for 400ms,
     and then moved *again* from 857ms to 1400ms, with a direction reversal in
     it. That second move is the page finally reaching the top, the bar
     un-condensing, and the 500ms font-size transition on seven tabs dragging
     the underline off the mark it had just landed on. It reads as the slide
     ending roughly, but the slide was fine — it was being pushed afterwards.

     Un-condensing at the moment of the click puts the tab resize and the
     underline slide on one clock, so they resolve together as a single motion.
     A hash is excluded because an anchor lands mid-page, not at the top. The
     scroll listener still has the final say the instant anything actually
     scrolls, so an assumption that turns out wrong costs a frame, not a bug —
     and the first render is skipped, since a reload with restored scroll
     position starts scrolled and has no click to be early for. */
  useEffect(() => {
    if (!navSettled.current) {
      navSettled.current = true;
      return;
    }
    if (location.hash) return;
    setCondensed(false);
  }, [location.pathname, location.hash]);

  /* The bar starts tall and settles into a thinner one as soon as the reader
     leaves the top of the page: at rest it is part of the composition, in
     motion it is a tool and wants less of the window.

     Two thresholds, not one. A single 24px line means a trackpad resting near
     it flips the bar back and forth, and each flip restarts a 500ms height
     change, a font-size step on seven tabs, a gap transition and the hairline
     fading — all of it half-finished, all of it at once. It condenses at 40
     and only expands again below 12, so crossing back costs a deliberate
     scroll rather than a twitch. */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setCondensed((prev) => (prev ? y > 12 : y > 40));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The large-title handoff, the way a native toolbar does it: while the page's
     own h1 is on screen the bar carries the brand, and once it scrolls under
     the bar the bar carries the title instead. Read from the DOM rather than
     passed down, because the h1 belongs to whichever page is mounted and
     threading it through every route would put a prop on pages that have no
     opinion about the navbar.

     The homepage has no #page-header, so it never finds one and the bar simply
     stays as it is — which is right: nobody needs to be told they are on the
     home page. */
  useEffect(() => {
    setPageTitle(null);
    const cameFromAnotherRoute = lastPath.current !== null && lastPath.current !== location.pathname;
    lastPath.current = location.pathname;

    // The homepage is skipped on purpose: its h1 is a sentence, not a name, and
    // nobody needs a toolbar telling them they are on the home page.
    if (location.pathname === "/") return;

    let io: IntersectionObserver | undefined;
    let raf = 0;
    let frames = 0;

    /* On a route change the outgoing page is still mounted when this effect
       fires, so querying for an h1 returns *its* title — which is how /services
       ended up labelled Aletheia and /aletheia ended up labelled with the
       resources headline.

       HashScroll solves its version of this by waiting for the element to go
       absent, and the comment there says AnimatePresence's "wait" mode
       guarantees a gap. Measured, there is no gap: sampling every frame across
       a client-side navigation, the h1 count goes 1 → 1 with the pathname
       changing between them, in about 3ms. So absence is not the signal.

       Identity is. The route subtree is keyed on the pathname, so a new page
       is a genuinely new DOM node even when its component type is the same.
       Hold the outgoing element and wait for the query to return a different
       one. */
    const outgoing =
      document.querySelector("#page-header h1") ?? document.querySelector("h1");

    const attempt = () => {
      const h1 =
        document.querySelector("#page-header h1") ?? document.querySelector("h1");

      if (h1 && (!cameFromAnotherRoute || h1 !== outgoing)) {
        // A page may hand the toolbar a shorter name than its headline.
        const text = (h1.getAttribute("data-toolbar-title") || h1.textContent || "")
          .replace(/\s+/g, " ")
          .trim();
        if (text) {
          io = new IntersectionObserver(
            ([entry]) => setPageTitle(entry.isIntersecting ? null : text),
            { rootMargin: "-64px 0px 0px 0px" }
          );
          io.observe(h1);
          return;
        }
      }
      // ~3s at 60fps: long enough for a lazy route and its lazy sections on a
      // slow connection, short enough to give up rather than spin.
      if (frames++ < 180) raf = requestAnimationFrame(attempt);
    };

    raf = requestAnimationFrame(attempt);
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [location.pathname]);

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => window.scrollTo(0, 0), 50);
    } else {
      scrollToTop();
    }
  };

  /* Both conditions: the reader has left the top *and* there is a title to put
     there. Collapsing the wordmark with nothing to replace it would just leave
     a bare mark floating in an empty bar. */
  const handoff = condensed && pageTitle !== null;

  /* The row's own step-down, which is *not* the same condition — and was, which
     is why the homepage was the one page whose tabs never shrank. The bar
     there condenses like everywhere else, but the homepage has no large-title
     handoff on purpose (its h1 is a sentence, not a name), so the row had
     nothing to trigger on and sat at full size while every other page's row
     stepped down. Reading them side by side, the homepage looked like it had
     missed the memo.

     Interior pages keep the coupling that makes the step read as deliberate:
     the tabs give ground at the moment the title needs it. The homepage has no
     such moment, so it uses the only signal it has — the same scroll position
     that already shrank the bar around it. */
  const compact = condensed && (pageTitle !== null || location.pathname === "/");

  /* The row gives the title its space rather than fighting it for the row:
     once the bar has taken over the page title, the tabs step down a size and
     tighten. Small enough to still read as the same navigation, different
     enough that the title has somewhere to land. */
  /* 70% rather than 60%. Computed against the tokens, `foreground/60` on a
     solid bar is 6.22:1 in dark and 4.63:1 in light — the light theme was
     already within a rounding error of the 4.5 floor for the site's primary
     navigation, before any glass was put behind it, and measured over the
     homepage hero it fell to 4.37. 70% reads at 8.17 and 6.51, which leaves
     the bar free to be as transparent as it looks best being. The active tab
     keeps its hierarchy from the gold and the underline, not from being the
     only legible thing in the row.

     `transition-all` here meant the browser watched every animatable property
     on seven links for a change; the only two that ever change are the colour
     and, during a handoff, the size. */
  const linkClasses =
    "group relative py-1 font-medium uppercase tracking-[0.16em] text-foreground/70 transition-[color,font-size] duration-500 ease-calm hover:text-primary";

  /* A mixed-case label needs about 15% more type to carry the same cap height
     as its shouting neighbours, so "GovCon" is sized off them rather than set
     once and left behind when the row steps down. */
  const sizeFor = (keepCase?: boolean) =>
    keepCase
      ? `normal-case tracking-[0.01em] ${compact ? "text-[11.5px]" : "text-[12.5px]"}`
      : compact
        ? "text-[10px]"
        : "text-[11px]";

  const isActive = (route: string) =>
    location.pathname === route || location.pathname.startsWith(`${route}/`);

  return (
    <motion.nav
      data-print-hide
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: DUR.base, ease: EASE }}
      style={{ "--nav-alpha": navAlpha } as React.CSSProperties}
      /* Opaque by default; the lg media query in index.css is what makes it
         glass. The old 95% let a 5% ghost of the page underneath print through
         the bar on phones — legible enough to read the words behind the title,
         which is worse than either a solid bar or a properly blurred one. */
      className={`nav-surface fixed top-0 left-0 right-0 z-50 border-b bg-background transition-colors ${
        condensed ? "border-foreground/[0.10]" : "border-foreground/[0.08]"
      }`}
    >
      <div className="relative">
        <div
          className={`container mx-auto flex items-center justify-between px-6 transition-[height] duration-500 ease-calm-in-out ${
            condensed ? "h-14" : "h-16 md:h-[4.5rem]"
          }`}
        >
          {/* Brand and title occupy the same strip, but only the brand is in
              the flow. That is the whole fix for a handoff that used to arrive
              in two jolts: with both in the flex row they competed for the same
              shrinking width, so the wordmark opened part-way while the title
              was still exiting, and then snapped the rest of the way the frame
              the title unmounted and gave its width back. The longer the title,
              the harder the snap — which is exactly how it read on /services and
              not at all on /aletheia. Out of flow, the title cannot push
              anything, and the wordmark's reveal is the only width in motion. */}
          <div className="relative flex min-w-0 flex-1 items-center">
          {/* The wordmark keeps its box once it is invisible, and the title is
              drawn over that box — so without this, clicking the page title in
              the toolbar would quietly navigate home. Killing pointer events on
              the link and restoring them on the mark alone leaves exactly the
              logo clickable during a handoff; the click still bubbles to the
              anchor, so the behaviour is unchanged where it should be. */}
          <a
            href="/"
            onClick={goHome}
            className={`flex items-center gap-2.5 font-display tracking-tight ${
              handoff ? "pointer-events-none" : ""
            }`}
          >
            <motion.img
              src={logo}
              alt="Athena Data Labs logo"
              /* Lowercase deliberately: React 18 does not know the camelCase
                 `fetchPriority` prop and warns on every render before falling
                 back to this exact attribute anyway. */
              {...{ fetchpriority: "high" }}
              decoding="async"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="brand-art pointer-events-auto h-8 w-8 object-contain"
            />
            {/* The mark and the wordmark both came down a step with the bar. A
                44px logo and a 24px wordmark were sized for a 64px bar; at 56px
                they left no air above or below, which is what made the header
                read as heavy however little was in it. */}
            {/* The wordmark steps aside for the page title. It hands over by
                fading and drifting a couple of pixels left — opacity and
                transform, nothing else — and it keeps its width the whole time.

                That last part is the point. This used to clip itself to zero
                with a max-width transition, which is a layout animation: the
                browser reflows the row on every frame of it, and everything in
                the row is liable to move. There is no longer anything to
                reflow *for*, because the title is positioned out of the flow
                and does not want the space — so the space can stay reserved
                and empty behind an invisible wordmark. What the eye sees is
                the same. What the compositor does is two properties it can
                animate by itself, without asking the layout engine anything.

                The mark stays put: the brand should never leave the bar. */}
            <span
              aria-hidden={handoff}
              className={`inline-flex items-baseline gap-1.5 whitespace-nowrap font-bold transition-[opacity,transform] duration-[700ms] ease-calm ${
                handoff ? "-translate-x-2 opacity-0" : "translate-x-0 opacity-100"
              }`}
            >
              <span className="text-gradient text-base tracking-[0.16em] sm:text-lg">ATHENA</span>
              <span className="text-gradient text-sm tracking-[0.16em] sm:text-base">DATA LABS</span>
            </span>
          </a>

          {/* The title the bar took over, sliding into the space the wordmark
              just gave back. Truncated rather than wrapped: the bar has one row
              and a two-line toolbar is worse than an ellipsis. Left offset is the
              mark's width plus the brand gap, so the title lands exactly where
              the wordmark's first letter was rather than near it. */}
          <AnimatePresence mode="wait">
            {handoff && (
              <motion.span
                key={pageTitle}
                /* Enters from the right and settles where the wordmark was, so it
                   reads as the title moving into the brand's seat rather than a
                   second label appearing beside it. */
                /* y is carried in the transform rather than a `-translate-y-1/2`
                   class because framer owns `transform` on this element and the
                   two would overwrite each other. */
                initial={{ opacity: 0, x: 28, y: "-50%" }}
                animate={{ opacity: 1, x: 0, y: "-50%" }}
                /* The exit is quicker than the entrance on purpose: the title
                   leaving is the reader scrolling back to the top, and they are
                   already looking at what replaces it. */
                exit={{ opacity: 0, x: 20, y: "-50%", transition: { duration: DUR.quick, ease: EASE } }}
                transition={{ duration: DUR.base, ease: EASE }}
                className="pointer-events-none absolute left-[calc(2rem+0.625rem)] right-4 top-1/2 truncate font-display text-base font-semibold leading-none tracking-tight text-foreground"
              >
                {pageTitle}
              </motion.span>
            )}
          </AnimatePresence>
          </div>

          {/* Desktop */}
          <div
            /* The gap is transitioned, not just switched. Every tab's font-size
               is already on a 500ms transition, so without this the labels grew
               smoothly while the spaces between them stepped in one frame — a
               row that resizes in two different ways at once. */
            className={`hidden shrink-0 items-center transition-[column-gap] duration-500 ease-calm lg:flex ${
              compact ? "gap-2.5 xl:gap-3" : "gap-3 xl:gap-4"
            }`}
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.route}
                className={`${linkClasses} ${sizeFor(item.keepCase)} ${
                  isActive(item.route) ? "text-primary" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
                <Underline active={isActive(item.route)} />
              </Link>
            ))}
            <ThemeToggle />
            {/* 213px of button. Below xl the row cannot hold it and it used to be
                clipped off the right edge rather than dropped, which meant the
                primary CTA was invisible on every window between 768 and 1150. */}
            {/* The button variant forces every icon inside it to 16px, which is
                why an `ArrowUpRight size={13}` still came out looking like a
                road sign: the glyph was as tall as the cap height of the words
                beside it. 12px arrow, a point more type, and the padding pulled
                in — the label is what the button is for, the arrow is only there
                to say the link leaves the site.

                147px rather than 213px, which moves the width where it can be
                shown down from 1280 to 1100. Measured rather than picked: at
                1080 the nav row and the wordmark are 13px apart, at 1120 they
                are 53px apart, and the button is not worth a header that looks
                packed. Below that it drops out and the mobile sheet carries it. */}
            <Button
              variant="hero"
              size="sm"
              className="hidden h-8 gap-1.5 px-3 text-[11px] tracking-[0.1em] min-[1100px]:inline-flex [&_svg]:size-3"
              asChild
            >
              <a
                href={THERA_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Thera, our capture intelligence platform, in a new tab"
                data-umami-event="open-thera-nav"
              >
                See Thera Live <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            {/* Mobile toggle */}
            <button
            className="-mr-2 p-2 text-foreground/70 transition-colors hover:text-steel"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Read position, along the bottom edge of the bar. Sits on the border
            rather than under it, so at rest there is nothing extra on the page —
            the hairline only exists as far as you have read. Steel rather than
            gold on purpose: gold is spoken for by the active tab a few pixels
            above it, and two accents in one bar is one too many. Hidden at the
            very top, where a stub of colour under an unscrolled page would be a
            decoration and this is meant to be an instrument. Pinned to the row
            rather than to the nav, so an open mobile menu does not drag it down
            the screen. */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className={`absolute inset-x-0 -bottom-px h-[2px] origin-left bg-steel/70 transition-opacity duration-500 ease-calm ${
            condensed ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Mobile menu. AnimatePresence because without it the panel opens on an
          animation and then simply ceases to exist on close — the asymmetry is
          the tell. `overflow-hidden` because a height animation on its own
          leaves the links spilling out of the box while it collapses. */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="overflow-hidden border-t border-foreground/[0.08] bg-background lg:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.route}
                  className={`group relative w-fit py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 hover:text-primary ${
                    item.keepCase ? "normal-case text-[12.5px] tracking-[0.01em]" : ""
                  } ${isActive(item.route) ? "text-primary" : "text-muted-foreground"}`}
                  /* The mobile sheet never condenses, so its labels keep one size. */
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                  {/* Plain, not shared: the desktop row is `display:none` here
                      rather than unmounted, and two live elements claiming one
                      layoutId make framer animate between them. */}
                  <Underline active={isActive(item.route)} shared={false} />
                </Link>
              ))}
              <Button variant="hero" size="sm" asChild>
                <a
                  href={THERA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open the live Aegis BI dashboard in a new tab"
                  onClick={() => setMobileOpen(false)}
                  data-umami-event="open-thera-nav"
                >
                  See Thera Live <ArrowUpRight size={15} aria-hidden="true" className="ml-0.5" />
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
