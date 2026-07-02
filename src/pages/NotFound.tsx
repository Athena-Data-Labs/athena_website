import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo
        title="Page Not Found"
        description="The page you are looking for could not be found."
        path={location.pathname}
        noindex
      />
      <Navbar />
      <main className="flex flex-1 items-center border-b border-white/[0.06] bg-[#0a0c10] pt-16">
        <div className="container mx-auto px-6 py-20">
          <span className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
            <span className="h-3.5 w-[2px] shrink-0 bg-primary" />
            404 · Not Found
          </span>
          <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.03em] text-white sm:text-6xl">
            Off the <span className="text-gradient">Map</span>
          </h1>
          <div className="mt-5 h-px w-24 bg-primary/40" />
          <p className="mt-5 max-w-md text-base leading-[1.72] text-muted-foreground">
            The page you're looking for doesn't exist or has moved. Try the homepage, or explore
            our products and resources from the navigation.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
