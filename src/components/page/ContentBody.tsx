import type { ContentDiagram, ContentSection } from "@/content/types";

/** Dependency-free flow diagram: titled panels of node chains with arrows. */
const DiagramBlock = ({ diagram }: { diagram: ContentDiagram }) => (
  <figure className="mt-6">
    <div className="space-y-4">
      {diagram.groups.map((group) => (
        <div key={group.title} className="border border-white/[0.08] bg-white/[0.02] p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{group.title}</p>
          <div className="mt-3 space-y-2.5">
            {group.flows.map((flow, i) => (
              <div key={i} className="flex flex-wrap items-center gap-y-2">
                {flow.map((node, j) => (
                  <span key={j} className="flex items-center">
                    {j > 0 && <span aria-hidden className="mx-2 text-primary/60">→</span>}
                    <span
                      className={
                        node.kind === "store"
                          ? "border border-primary/40 bg-primary/[0.07] px-2.5 py-1 font-mono text-[11px] text-primary/90"
                          : "border border-white/[0.1] bg-[#0a0c10] px-2.5 py-1 font-mono text-[11px] text-slate-200/90"
                      }
                    >
                      {node.label}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    {diagram.caption && (
      <figcaption className="mt-3 text-xs leading-[1.7] text-muted-foreground/80">{diagram.caption}</figcaption>
    )}
  </figure>
);

/**
 * Renders long-form article/case-study sections in the site's flat style:
 * gold left-bar headings, readable measure, hairline-accented bullets.
 */
const ContentBody = ({ sections }: { sections: ContentSection[] }) => {
  return (
    <div className="max-w-3xl">
      {sections.map((section) => (
        <section key={section.heading} className="mt-10 first:mt-0">
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight text-foreground">
            <span className="h-5 w-[2px] shrink-0 bg-primary" />
            {section.heading}
          </h2>
          {section.paragraphs.map((p, i) => (
            <p key={i} className="mt-4 text-base leading-[1.8] text-muted-foreground">
              {p}
            </p>
          ))}
          {section.bullets && (
            <ul className="mt-4 space-y-2.5 border-l-2 border-primary/25 pl-5">
              {section.bullets.map((b) => (
                <li key={b} className="text-sm leading-[1.7] text-muted-foreground">
                  {b}
                </li>
              ))}
            </ul>
          )}
          {section.bulletGroups?.map((group) => (
            <div key={group.title} className="mt-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{group.title}</h3>
              <ul className="mt-2.5 space-y-2.5 border-l-2 border-primary/25 pl-5">
                {group.bullets.map((b) => (
                  <li key={b} className="text-sm leading-[1.7] text-muted-foreground">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {section.diagram && <DiagramBlock diagram={section.diagram} />}
          {section.closingParagraphs?.map((p, i) => (
            <p key={i} className="mt-4 text-base leading-[1.8] text-muted-foreground">
              {p}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
};

export default ContentBody;
