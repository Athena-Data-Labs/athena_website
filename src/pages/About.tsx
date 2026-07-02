import { lazy, Suspense } from "react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";

const FounderSection = lazy(() => import("@/components/FounderSection"));

const SectionFallback = () => <div className="h-24" aria-hidden="true" />;

const About = () => {
  return (
    <PageShell
      eyebrow="About"
      title={
        <>
          Built on <span className="text-gradient">Delivery</span>, Not Slides
        </>
      }
      intro="Athena Data Labs is a data science and AI product studio. We earn trust the only way that counts: by designing, building, and shipping intelligence systems that run in production."
    >
      <Seo
        title="About — Founder & Company"
        description="About Athena Data Labs: a data science and AI product studio led by its founder and technical lead, with shipped products including Aegis BI and MyBudgetNerd."
        path="/about"
      />

      <Suspense fallback={<SectionFallback />}>
        <FounderSection />
      </Suspense>
    </PageShell>
  );
};

export default About;
