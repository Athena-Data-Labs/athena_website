import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { scrollToTop } from "@/lib/scroll";
import { Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0a0c10] py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row">
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
        <div className="text-center text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:text-right">
          <div className="mb-2 flex items-center justify-center gap-3 md:justify-end">
            <Link to="/privacy" className="transition-colors hover:text-primary">Privacy</Link>
            <span className="text-white/20">·</span>
            <Link to="/terms" className="transition-colors hover:text-primary">Terms</Link>
          </div>
          <p>© 2026 Athena Data Labs,</p>
          <p>A division of Athena Analytics LLC.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
