import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import CtaSection from "@/components/CtaSection";
import FederalTeaming from "@/components/FederalTeaming";

const Contact = () => {
  return (
    <PageShell
      greek={{ word: "διάλογος", roman: "dialogos", gloss: "conversation" }}
      eyebrow="Contact"
      title={
        <>
          Let&apos;s Talk About <span className="text-gradient">Your Data</span>
        </>
      }
      intro="Tell us where your data is and where your decisions need to be. We'll respond with a practical next-step plan for scope, timeline, and delivery. Teaming and subcontracting inquiries are welcome too."
    >
      <Seo
        title="Contact"
        description="Contact Athena Data Labs about business intelligence, AI agents, and forecasting — or about teaming with an SBA-certified SDVOSB on a federal contract."
        path="/contact"
        image="/og/contact.png"
      />

      <CtaSection />

      {/* A prime assembling a team needs different fields than a software buyer,
          and both of them land here. */}
      <FederalTeaming />
    </PageShell>
  );
};

export default Contact;
