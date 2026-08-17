import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, BookOpen, Boxes, FileText, Mail, Wrench } from "lucide-react";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";

const destinations = [
  {
    to: "/products",
    icon: Boxes,
    title: "Products",
    description: "Aegis BI, MyBudgetNerd, Thera, and ANN Builder Studio, with pricing.",
  },
  {
    to: "/resources/field-notes",
    icon: BookOpen,
    title: "Field Notes",
    description: "Engineering write-ups from our own production systems, post-mortems included.",
  },
  {
    to: "/resources/case-studies",
    icon: FileText,
    title: "Case Studies",
    description: "How the products were built, what they changed, and what we learned.",
  },
  {
    to: "/services",
    icon: Wrench,
    title: "Services",
    description: "The six disciplines we work in, and the products each one produced.",
  },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Anyone deep-linking into the old Insights collection deserves to be told
  // what happened rather than left staring at a dead end.
  const fromResources = location.pathname.startsWith("/resources");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo
        title="Page Not Found"
        description="The page you are looking for could not be found."
        path={location.pathname}
        noindex
      />
      <div className="flex-1 border-b border-foreground/[0.06] bg-background pt-16">
        <div className="container mx-auto px-6 py-20">
          <span className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/55">
            <span className="h-3.5 w-[2px] shrink-0 bg-steel" />
            404 · Not Found
          </span>
          <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.03em] text-foreground sm:text-6xl">
            Off the <span className="text-gradient">Map</span>
          </h1>
          <div className="mt-5 h-px w-24 bg-steel/40" />
          <p className="mt-5 max-w-xl text-base leading-[1.72] text-muted-foreground">
            {fromResources
              ? "That address doesn't resolve. We recently reorganized our writing into two collections (Case Studies for what we shipped, Field Notes for how it was built), so an older link may have pointed at a page that has since moved."
              : "That address doesn't resolve: it either never existed or has since moved. Here is everything worth reading instead."}
          </p>
          <p className="mt-3 font-mono text-xs text-foreground/30">{location.pathname}</p>

          <div className="mt-12 grid gap-px border border-foreground/[0.07] bg-foreground/[0.05] sm:grid-cols-2">
            {destinations.map((d) => (
              <Link
                key={d.to}
                to={d.to}
                className="group flex flex-col bg-background p-7 transition-colors hover:bg-foreground/[0.02]"
              >
                <d.icon size={20} className="text-steel" />
                <h2 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">
                  {d.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-[1.65] text-muted-foreground">
                  {d.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/50 transition-colors group-hover:text-steel">
                  Open <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to Home <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-steel/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-steel transition-colors hover:bg-steel/10"
            >
              <Mail size={15} /> Tell Us What Broke
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
