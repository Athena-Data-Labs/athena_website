import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import CtaSection from "@/components/CtaSection";

const Contact = () => {
  return (
    <PageShell
      eyebrow="Contact"
      title={
        <>
          Let&apos;s Talk About <span className="text-gradient">Your Data</span>
        </>
      }
      intro="Tell us where your data is and where your decisions need to be. We'll respond with a practical next-step plan for scope, timeline, and delivery."
    >
      <Seo
        title="Contact"
        description="Contact Athena Data Labs to discuss business intelligence, AI agents, forecasting, and data product delivery. Book a strategy call or send a project inquiry."
        path="/contact"
      />

      <CtaSection />
    </PageShell>
  );
};

export default Contact;
