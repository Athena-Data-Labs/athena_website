import { lazy, Suspense } from "react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";

const FounderSection = lazy(() => import("@/components/FounderSection"));

const SectionFallback = () => <div className="h-24" aria-hidden="true" />;

const About = () => {
  return (
    <PageShell
      greek={{ word: "ἦθος", roman: "ethos", gloss: "character" }}
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
        description="About Athena Data Labs: a decision intelligence studio led by a founder with ten years of defense operations research, and shipped products including Aegis BI and MyBudgetNerd."
        path="/about"
        image="/og/about.png"
      />

      <Suspense fallback={<SectionFallback />}>
        <FounderSection />
      </Suspense>
    </PageShell>
  );
};

export default About;
