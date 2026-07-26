import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import LinkCards from "@/components/page/LinkCards";
import SubscribeCard from "@/components/SubscribeCard";
import ConsultationCta from "@/components/ConsultationCta";
import { fieldNotes } from "@/content";
import { byDateDesc, formatMonthYear } from "@/lib/utils";

const FieldNotesIndex = () => {
  const items = byDateDesc(fieldNotes).map((a) => ({
    to: `/resources/field-notes/${a.slug}`,
    tag: a.categories.join(" · "),
    title: a.title,
    description: a.summary,
    meta: `${a.readingTimeMinutes} min read · ${formatMonthYear(a.date)}`,
  }));

  return (
    <PageShell
      greek={{ word: "τέχνη", roman: "techne", gloss: "craft" }}
      eyebrow="Field Notes"
      title={
        <>
          What We Learned <span className="text-gradient">Building It</span>
        </>
      }
      intro="Engineering notes from our own production systems: architecture decisions, migrations, the patterns that held, and the ones that broke. Written for the person who has to implement it."
      breadcrumb={{ label: "Resources", to: "/resources" }}
    >
      <Seo
        title="Field Notes: Engineering Write-Ups"
        description="Engineering field notes from Athena Data Labs: AWS account architecture, privacy-first backends, React SPA SEO, dashboard design, forecasting, and human-in-the-loop AI agents."
        path="/resources/field-notes"
        image="/og/field-notes.png"
      />

      <section className="border-b border-white/[0.06] panel py-12 md:py-16">
        <div className="container mx-auto px-6">
          <LinkCards items={items} ctaLabel="Read Note" columns={2} />

          <div className="mt-12">
            <SubscribeCard
              heading="Get the next field note"
              description="One email when we publish, covering what we built, what it cost, and what went wrong. No newsletter, no drip sequence."
              note="We use your address for this list only. Unsubscribe in one click."
              subject="Field Notes subscription"
              umamiEvent="subscribe-field-notes"
            />
          </div>
        </div>
      </section>

      <ConsultationCta />
    </PageShell>
  );
};

export default FieldNotesIndex;
