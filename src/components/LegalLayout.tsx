import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type LegalLayoutProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

const LegalLayout = ({ title, updated, children }: LegalLayoutProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="relative border-b border-white/[0.06] bg-[#0a0c10] pt-28 pb-10 md:pt-32 md:pb-12">
        <div className="container mx-auto max-w-3xl px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={14} /> Athena Data Labs
          </Link>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Last updated · {updated}
          </p>
        </div>
      </header>

      <main className="legal container mx-auto max-w-3xl px-6 py-12 md:py-16">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
