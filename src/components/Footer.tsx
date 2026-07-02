import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.webp";
import { scrollToTop } from "@/lib/scroll";
import { Facebook, Linkedin } from "lucide-react";
import { services, products } from "@/content";

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
      { label: "Insights", to: "/resources/insights" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0a0c10] py-12">
      <div className="container mx-auto px-6">
        {/* Top: brand + social */}
        <div className="flex flex-col items-center justify-between gap-6 border-b border-white/[0.06] pb-8 md:flex-row">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              className="flex items-center gap-3 font-display tracking-tight"
            >
              <motion.img
                src={logo}
                alt="Athena Data Labs logo"
                className="h-10 w-10 object-contain"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              />
              <span className="inline-flex items-baseline gap-2 whitespace-nowrap font-bold">
                <span className="text-gradient text-lg tracking-[0.14em] sm:text-xl">ATHENA</span>
                <span className="text-gradient text-[0.96em] tracking-[0.14em]">DATA LABS</span>
              </span>
            </a>
            <span className="hidden h-6 w-px bg-white/10 md:block" />
            <div className="flex items-center gap-0.5">
              <a
                href="https://www.facebook.com/share/19Dsg2FzDk/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Facebook"
                className="inline-flex h-9 w-9 items-center justify-center text-white/45 transition-colors hover:bg-white/[0.05] hover:text-primary"
                title="Follow on Facebook"
              >
                <Facebook size={18} strokeWidth={1.75} />
              </a>
              <a
                href="https://www.linkedin.com/company/athena-data-labs/about/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center text-white/45 transition-colors hover:bg-white/[0.05] hover:text-primary"
                title="Connect on LinkedIn"
              >
                <Linkedin size={18} strokeWidth={1.75} />
              </a>
            </div>
          </div>
          <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground/70 md:text-right">
            Business intelligence, AI agents, and data products — designed, built, shipped.
          </p>
        </div>

        {/* Middle: sitemap columns */}
        <div className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70">
                {col.heading}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-xs text-muted-foreground transition-colors hover:text-primary"
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
        <div className="flex flex-col items-center gap-2 border-t border-white/[0.06] pt-6 text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:flex-row md:justify-between">
          <p>© 2026 Athena Data Labs, a division of Athena Analytics LLC.</p>
          <p className="text-muted-foreground/60">Apple Developer Program Member</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
