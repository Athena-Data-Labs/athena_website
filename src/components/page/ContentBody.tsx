import type { ContentSection } from "@/content/types";

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
        </section>
      ))}
    </div>
  );
};

export default ContentBody;
