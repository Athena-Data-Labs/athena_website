import { lazy, Suspense } from "react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";

const FounderSection = lazy(() => import("@/components/FounderSection"));
const CompanyCertifications = lazy(() => import("@/components/CompanyCertifications"));
const ClientReviews = lazy(() => import("@/components/ClientReviews"));

const SectionFallback = () => <div className="h-24" aria-hidden="true" />;

const About = () => {
  return (
    <PageShell
      greek={{ word: "ἦθος", roman: "ēthos", gloss: "character" }}
      eyebrow="About"
      title={
        <>
          Built on <span className="text-gradient">Delivery</span>, Not Slides
        </>
      }
      intro="Athena Data Labs is a decision intelligence studio. We earn trust the only way that counts: by designing, building, and shipping systems that run in production, with our own name on them."
    >
      <Seo
        title="About: Founder & Company"
        description="An SBA-certified SDVOSB decision intelligence studio, led by a founder with ten years of defense operations research and four products shipped to production."
        path="/about"
        image="/og/about.png"
      />

      <Suspense fallback={<SectionFallback />}>
        <FounderSection />
      </Suspense>

      {/* The founder's record, then the company's own standing — different
          claims, and a prime looking for a certified sub needs the second. */}
      <Suspense fallback={<SectionFallback />}>
        <CompanyCertifications />
      </Suspense>

      {/* The two above are ours to tell. This is not. */}
      <Suspense fallback={<SectionFallback />}>
        <ClientReviews />
      </Suspense>
    </PageShell>
  );
};

export default About;
