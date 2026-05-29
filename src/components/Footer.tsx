import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { scrollToTop } from "@/lib/scroll";
import { Linkedin, Github } from "lucide-react";

const AppStoreIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.4 18.2h7.2" />
    <path d="M9.7 6.2 16.8 18.2" />
    <path d="M14.3 6.2 7.2 18.2" />
    <path d="M5.6 13.5h12.8" opacity="0.85" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-3">
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
              className="h-10 w-10 object-contain drop-shadow-[0_0_6px_hsl(38,45%,60%,0.3)]"
              whileHover={{ 
                rotate: [0, -5, 5, 0],
                filter: "drop-shadow(0 0 8px hsl(38 45% 60% / 0.6))"
              }}
              transition={{ duration: 0.4 }}
            />
            <span className="inline-flex items-baseline gap-2 whitespace-nowrap font-bold">
              <span className="text-gradient text-lg tracking-[0.14em] sm:text-xl">ATHENA</span>
              <span className="text-gradient text-[0.96em] tracking-[0.14em]">DATA LABS</span>
            </span>
          </a>
          <div className="flex gap-2">
            <a
              href="https://apps.apple.com/us/app/mybudgetnerd/id6761061061"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View MyBudgetNerd on the App Store"
              className="inline-flex items-center justify-center rounded-full p-2 text-primary hover:bg-primary/10 transition-colors"
              title="MyBudgetNerd on the App Store"
            >
              <AppStoreIcon />
            </a>
            <a
              href="https://github.com/Athena-Data-Labs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit GitHub"
              className="inline-flex items-center justify-center rounded-full p-2 text-primary hover:bg-primary/10 transition-colors"
              title="Visit GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/athena-data-labs/about/?viewAsMember=true"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect on LinkedIn"
              className="inline-flex items-center justify-center rounded-full p-2 text-primary hover:bg-primary/10 transition-colors"
              title="Connect on LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground md:text-right">
          <p>© 2026 Athena Data Labs,</p>
          <p>A division of Athena Analytics LLC.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
