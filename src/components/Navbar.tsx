import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DASHBOARD_OPEN_URL } from "@/lib/dashboard";
import { scrollToTop } from "@/lib/scroll";
import logo from "@/assets/logo.webp";

type NavItem = { label: string; route: string };

const navItems: NavItem[] = [
  { label: "Services", route: "/services" },
  { label: "Products", route: "/products" },
  { label: "Resources", route: "/resources" },
  { label: "Aletheia", route: "/aletheia" },
  { label: "About", route: "/about" },
  { label: "Contact", route: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Every link closes the menu itself, but the back button changes the route
  // without going through one — and left the menu sitting open over the page
  // you had just returned to.
  useEffect(() => setMobileOpen(false), [location.pathname]);

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

  const linkClasses =
    "group relative py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/60 transition-colors duration-200 hover:text-primary";

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
      className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/[0.08] bg-background/95 md:bg-background/70 md:backdrop-blur-xl md:supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
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
          <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap font-bold">
            <span className="text-gradient text-base tracking-[0.16em] sm:text-lg">ATHENA</span>
            <span className="text-gradient text-sm tracking-[0.16em] sm:text-base">DATA LABS</span>
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.route}
              className={`${linkClasses} ${isActive(item.route) ? "text-primary" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
              <Underline active={isActive(item.route)} />
            </Link>
          ))}
          <ThemeToggle />
          <Button variant="hero" size="sm" asChild>
            <a
              href={DASHBOARD_OPEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Open the live Aegis BI dashboard in a new tab"
              data-umami-event="open-aegis-nav"
            >
              See Aegis BI Live <ArrowUpRight size={15} className="ml-0.5" />
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
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
            className="overflow-hidden border-t border-foreground/[0.08] bg-background md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.route}
                  className={`group relative w-fit py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 hover:text-primary ${
                    isActive(item.route) ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                  <Underline active={isActive(item.route)} />
                </Link>
              ))}
              <Button variant="hero" size="sm" asChild>
                <a
                  href={DASHBOARD_OPEN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open the live Aegis BI dashboard in a new tab"
                  onClick={() => setMobileOpen(false)}
                  data-umami-event="open-aegis-nav"
                >
                  See Aegis BI Live <ArrowUpRight size={15} className="ml-0.5" />
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
