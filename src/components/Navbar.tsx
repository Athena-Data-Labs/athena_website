import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
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

  // Navbar is always dark, so always use the dark-mode logo
  const currentLogo = logo;

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
    "group relative py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60 transition-colors duration-200 hover:text-[#d9ad5a]";

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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#0a0c10]/70 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0c10]/60"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <a
          href="/"
          onClick={goHome}
          className="flex items-center gap-3 font-display tracking-tight"
        >
          <motion.img
            src={currentLogo}
            alt="Athena Data Labs logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-11 w-11 object-contain"
          />
          <span className="inline-flex items-baseline gap-2 whitespace-nowrap font-bold">
            <span className="text-gradient text-xl tracking-[0.16em] sm:text-2xl">ATHENA</span>
            <span className="text-gradient text-lg tracking-[0.16em] sm:text-xl">DATA LABS</span>
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.route}
              className={`${linkClasses} ${isActive(item.route) ? "text-[#d9ad5a]" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
              <Underline active={isActive(item.route)} />
            </Link>
          ))}
          <Button variant="hero" size="sm" asChild>
            <a href={DASHBOARD_OPEN_URL} target="_blank" rel="noopener noreferrer" data-umami-event="open-aegis-nav">
              Open Aegis BI
            </a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="-mr-2 p-2 text-white/70 transition-colors hover:text-primary md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-white/[0.08] bg-[#0a0c10]/90 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-4 px-6 py-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.route}
                className={`group relative w-fit py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-200 hover:text-[#d9ad5a] ${
                  isActive(item.route) ? "text-[#d9ad5a]" : "text-muted-foreground"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
                <Underline active={isActive(item.route)} />
              </Link>
            ))}
            <Button variant="hero" size="sm" asChild>
              <a href={DASHBOARD_OPEN_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} data-umami-event="open-aegis-nav">
                Open Aegis BI
              </a>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
