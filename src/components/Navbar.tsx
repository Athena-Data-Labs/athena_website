import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { THERA_URL } from "@/lib/dashboard";
import { scrollToTop } from "@/lib/scroll";
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

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const lastPath = useRef<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Every link closes the menu itself, but the back button changes the route
  // without going through one — and left the menu sitting open over the page
  // you had just returned to.
  useEffect(() => setMobileOpen(false), [location.pathname]);

  /* The bar starts tall and settles into a thinner one as soon as the reader
     leaves the top of the page: at rest it is part of the composition, in
     motion it is a tool and wants less of the window. 24px rather than 0 so a
     trackpad twitch at the top of the page cannot flicker it, and the state is
     only ever written when it actually changes. */
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setCondensed((prev) => (prev === next ? prev : next));
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

  /* The row gives the title its space rather than fighting it for the row:
     once the bar has taken over the page title, the tabs step down a size and
     tighten. Small enough to still read as the same navigation, different
     enough that the title has somewhere to land. */
  const linkClasses =
    "group relative py-1 font-medium uppercase tracking-[0.16em] text-foreground/60 transition-all duration-300 hover:text-primary";

  /* A mixed-case label needs about 15% more type to carry the same cap height
     as its shouting neighbours, so "GovCon" is sized off them rather than set
     once and left behind when the row steps down. */
  const sizeFor = (keepCase?: boolean) =>
    keepCase
      ? `normal-case tracking-[0.01em] ${handoff ? "text-[11.5px]" : "text-[12.5px]"}`
      : handoff
        ? "text-[10px]"
        : "text-[11px]";

  const isActive = (route: string) =>
    location.pathname === route || location.pathname.startsWith(`${route}/`);

  /* Horizontal counterpart of the vertical accent bar used in section eyebrows:
     scales in from the left on hover, stays lit on the active route. */
  const Underline = ({ active }: { active: boolean }) => (
    <span
      className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-primary transition-transform duration-200 ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  );

  return (
    <motion.nav
      data-print-hide
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 transition-colors duration-300 lg:bg-background/70 lg:backdrop-blur-xl lg:supports-[backdrop-filter]:bg-background/60 ${
        condensed ? "border-foreground/[0.10]" : "border-foreground/[0.08]"
      }`}
    >
      <div
        className={`container mx-auto flex items-center justify-between px-6 transition-[height] duration-300 ease-out ${
          condensed ? "h-14" : "h-16 md:h-[4.5rem]"
        }`}
      >
        <a
          href="/"
          onClick={goHome}
          className="flex items-center gap-2.5 font-display tracking-tight"
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
            className="brand-art h-8 w-8 object-contain"
          />
          {/* The mark and the wordmark both came down a step with the bar. A
              44px logo and a 24px wordmark were sized for a 64px bar; at 56px
              they left no air above or below, which is what made the header
              read as heavy however little was in it. */}
          {/* The wordmark steps aside for the page title rather than competing
              with it for a row that has no spare width. The mark stays: the
              brand should never leave the bar entirely. */}
          <span
            className={`inline-flex items-baseline gap-1.5 overflow-hidden whitespace-nowrap font-bold transition-all duration-300 ease-out ${
              handoff ? "max-w-0 opacity-0" : "max-w-[16rem] opacity-100"
            }`}
          >
            <span className="text-gradient text-base tracking-[0.16em] sm:text-lg">ATHENA</span>
            <span className="text-gradient text-sm tracking-[0.16em] sm:text-base">DATA LABS</span>
          </span>
        </a>

        {/* The title the bar took over, sliding up into the space the wordmark
            just gave back. Truncated rather than wrapped: the bar has one row
            and a two-line toolbar is worse than an ellipsis. */}
        <AnimatePresence mode="wait">
          {handoff && (
            <motion.span
              key={pageTitle}
              /* Enters from the right and settles where the wordmark was, so it
                 reads as the title moving into the brand's seat rather than a
                 second label appearing beside it. */
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.34, ease: [0.22, 0.61, 0.36, 1] }}
              className="pointer-events-none mr-auto min-w-0 shrink truncate pl-2.5 font-display text-base font-semibold tracking-tight text-foreground"
            >
              {pageTitle}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Desktop */}
        <div
          className={`hidden items-center lg:flex ${
            handoff ? "gap-2.5 xl:gap-3" : "gap-3 xl:gap-4"
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
          <Button
            variant="hero"
            size="sm"
            className="hidden h-8 px-4 text-[10px] tracking-[0.12em] xl:inline-flex"
            asChild
          >
            <a
              href={THERA_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Thera, our capture intelligence platform, in a new tab"
              data-umami-event="open-thera-nav"
            >
              See Thera Live <ArrowUpRight size={13} className="ml-0.5" />
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
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
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
                  <Underline active={isActive(item.route)} />
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
                  See Thera Live <ArrowUpRight size={15} className="ml-0.5" />
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
