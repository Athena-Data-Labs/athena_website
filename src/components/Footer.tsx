import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.webp";
import logoLight from "@/assets/logo-light.webp";
import { scrollToTop } from "@/lib/scroll";
import { services, products, certificationAbbrs, SBA_VERIFY_URL } from "@/content";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/athena-data-labs/about/?viewAsMember=true" },
  { label: "Facebook", href: "https://www.facebook.com/share/19Dsg2FzDk/?mibextid=wwXIfr" },
];

const columns: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: "Services",
    links: services.map((s) => ({ label: s.name, to: `/services/${s.slug}` })),
  },
  {
    heading: "Products",
    links: products.map((p) => ({ label: p.name, to: `/products/${p.slug}` })),
  },
  {
    heading: "Resources",
    links: [
      { label: "All Resources", to: "/resources" },
      { label: "Case Studies", to: "/resources/case-studies" },
      { label: "Field Notes", to: "/resources/field-notes" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Capability Statement", to: "/government" },
      { label: "Contact", to: "/contact" },
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="panel panel-flush-bottom relative z-10 border-t border-foreground/[0.08] py-12">
      <div className="container mx-auto px-6">
        {/* Top: brand + social */}
        <div className="flex flex-col items-center justify-between gap-6 border-b border-foreground/[0.06] pb-8 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              className="flex items-center gap-3 font-display tracking-tight"
            >
              {/* Two drawings, CSS picks — see Navbar and ProductMark. */}
              <motion.span
                className="block h-10 w-10"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={logoLight}
                  alt="Athena Data Labs logo"
                  className="h-10 w-10 object-contain dark:hidden"
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src={logo}
                  alt="Athena Data Labs logo"
                  className="hidden h-10 w-10 object-contain dark:block"
                  loading="lazy"
                  decoding="async"
                />
              </motion.span>
              <span className="inline-flex items-baseline gap-2 whitespace-nowrap font-bold">
                <span className="text-gradient text-lg tracking-[0.14em] sm:text-xl">ATHENA</span>
                <span className="text-gradient text-[0.96em] tracking-[0.14em]">DATA LABS</span>
              </span>
            </a>
            <span className="hidden h-6 w-px bg-foreground/10 md:block" />
            {/* Set as type, not as brand badges: two colored logos next to the
                wordmark read as someone else's identity borrowing ours. */}
            <div className="flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.14em]">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-steel"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
          <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground/70 md:text-right">
            Decision intelligence systems: business intelligence, forecasting, and AI agents.
            Designed, built, shipped, and run by us.
          </p>
        </div>

        {/* Middle: sitemap columns */}
        <div className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-steel/70">
                {col.heading}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-steel"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: legal */}
        <div className="flex flex-col items-center gap-2 border-t border-foreground/[0.06] pt-6 text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:flex-row md:justify-between">
          <p>© 2026 Athena Data Labs, a division of Athena Analytics L.L.C.</p>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-muted-foreground/60 md:justify-end">
            {/* Named in words rather than shown as SBA's seal: the approval
                letter allows the icon on a website but not on marketing or
                advertising, and this footer is on every page of both. */}
            <a
              href={SBA_VERIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-steel"
            >
              {certificationAbbrs} · SBA-Certified
            </a>
            <span aria-hidden="true">·</span>
            <span>Apple Developer Program Member</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
