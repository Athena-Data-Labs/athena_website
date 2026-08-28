import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Clock,
  GraduationCap,
  FileText,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";
import CountUp from "@/components/CountUp";
import EventDisplay from "@/components/EventDisplay";
import { DUR, EASE } from "@/lib/motion";

/** Split into parts so the figures can count up without string surgery. */
const stats = [
  { icon: DollarSign, prefix: "$", to: 1.5, decimals: 1, suffix: "B", label: "Cost estimate support for major contract decisions" },
  { icon: TrendingUp, prefix: "$", to: 276.9, decimals: 1, suffix: "M", label: "Potential savings identified through modeled alternatives" },
  { icon: BarChart3, prefix: "$", to: 3, decimals: 0, suffix: "B+", label: "Lifecycle cost decisions supported through analysis" },
  { icon: Clock, prefix: "", to: 10, decimals: 0, suffix: " Years", label: "Operations research, analytics, and stakeholder delivery" },
];

const career = [
  {
    title: "Department of Defense",
    role: "Senior Data Scientist / Operations Research Analyst · 2016–2026",
    description:
      "Developed cost models and budget forecasts impacting multi-billion-dollar Army programs including the Stryker combat system. Led data validation processes for contract deliverables, earning the Achievement Medal for Civilian Service. Identified $276.9M in potential savings through alternative-system analysis. Created software for spent plan analysis and congressional review visualizations.",
  },
  {
    // Newest first among the products, and it was missing entirely — a shipped,
    // paid platform absent from the record that exists to list shipped things.
    title: "Thera · Athena Data Labs",
    role: "Founder & Technical Lead · GovCon Capture Intelligence · In Production",
    description:
      "Designed and built Thera, an AI-native capture intelligence platform for federal contractors, running in production and open for signup. Maintains a Digital Twin of each company, scores every live SAM.gov notice against it with visible reasoning and set-aside eligibility gating, generates AI opportunity briefings, and carries each pursuit through to a branded submission package. Its opt-in partner network returns a member's listing inside another member's search for a specific live contract.",
  },
  {
    title: "Aegis BI · Athena Data Labs",
    role: "Founder & Technical Lead · Business Intelligence Platform · In Production",
    description:
      "Designed and built Aegis BI, a business-intelligence platform that turns the spreadsheets a company already keeps, uploaded or connected in OneDrive and Google Sheets, into command-center dashboards with cash and revenue forecasting, what-if scenarios, and Glaukos, an in-product AI analyst that answers questions in plain English. Shipped to the App Store for iPhone, iPad and Mac, so the numbers reach the meeting. Privacy-first architecture: uploads stay on-device and the backend is stateless.",
  },
  {
    title: "MyBudgetNerd · Athena Data Labs",
    role: "Founder & Technical Lead · SaaS · iOS (App Store)",
    description:
      "Built and shipped MyBudgetNerd, a subscription SaaS personal-finance product live on the App Store with active subscribers. Automated PDF statement parsing, machine-learning transaction categorization, and the Oracle analysis engine for forecasting, anomaly detection, and plain-language explanation. Runs in Docker on EC2 inside its own AWS account, with privacy-first in-memory processing.",
  },
  {
    title: "Wayne State University",
    role: "Mathematics Tutor · 2015–2016",
    description:
      "Tutored students across foundational to advanced mathematics including differential equations, linear algebra, and quantum mechanics while participating in weekly research seminars.",
  },
  {
    title: "U.S. Marine Corps",
    role: "Platoon Sergeant · 2006–2015",
    description:
      "Led platoons of 15+ Marines across active duty and reserves. Managed a 200+ vehicle fleet, oversaw a $4.7M runway project in Alaska, and coordinated supply chain logistics in high-accountability environments.",
  },
];

const education = [
  { degree: "M.S. Physics", school: "Wayne State University", year: "2016–2019" },
  { degree: "B.S. Criminal Justice", school: "Wayne State University", year: "2010–2013" },
];

const certifications = [
  "IBM Data Science Professional (2025)",
  "Python for Data Science & Machine Learning (2024)",
  "Python Data Analysis: NumPy & Pandas",
];

/** Cited properly: a peer-reviewed paper is a credential, and a credential you
 *  cannot check is decoration. Venue and co-authors carry the weight. */
const publications = [
  {
    title:
      "Probing Early-time Longitudinal Dynamics with the Λ Hyperon's Spin Polarization in Relativistic Heavy-ion Collisions",
    venue: "Physical Review C 104, 054908 (2021)",
    authors: "Ryu, Jupic & Shen",
    href: "https://arxiv.org/abs/2106.08125",
    hrefLabel: "arXiv:2106.08125",
  },
  {
    title: "Orbital Angular Momentum and Fluid Vorticity in Relativistic Heavy Ion Collisions",
    venue: "M.S. thesis, Wayne State University",
    authors: "Jupic",
    href: "https://www.proquest.com/openview/731eb49d836c3fd7102c316058972db8/1?pq-origsite=gscholar&cbl=18750&diss=y",
    hrefLabel: "ProQuest",
  },
];


const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: DUR.reveal, delay, ease: EASE },
});

/** Section heading in the site's own idiom: accent tick, eyebrow, rule. */
const Heading = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <motion.div {...reveal()} className="mb-8">
    <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
      <span className="h-3 w-[2px] shrink-0 bg-steel" />
      {eyebrow}
    </p>
    <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
      {title}
    </h3>
    <div className="mt-3 h-px w-16 bg-steel/40" />
  </motion.div>
);

const FounderSection = () => {
  return (
    <section id="founder" className="relative py-12 md:py-20">
      <div className="container mx-auto px-6">
        {/* ── Editorial lead ──────────────────────────────────────────── */}
        <motion.div {...reveal()} className="mb-14 max-w-4xl md:mb-20">
          <p className="mb-4 flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
            <span className="h-3 w-[2px] shrink-0 bg-steel" />
            Leadership
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Founder & <span className="text-gradient">Technical Lead</span>
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">Athena Data Labs</p>

          <blockquote className="mt-8 border-l-2 border-steel/60 pl-6">
            <p className="font-display text-2xl font-bold leading-snug tracking-tight text-foreground md:text-3xl">
              "War refugee. Marine sergeant. Defense analyst.{" "}
              <span className="text-gradient">Now building decision intelligence systems.</span>"
            </p>
          </blockquote>

          <div className="mt-8 grid gap-x-10 gap-y-5 text-lg leading-[1.8] text-muted-foreground md:grid-cols-2">
            <p>
              Vahidin Jupic founded Athena Data Labs to build decision-grade intelligence systems: business
              intelligence dashboards, AI agents, and analytics that transform data into confident action.
            </p>
            <p>
              His analytical work has informed critical decisions supporting $3B+ in strategic planning,
              identified $276.9M in potential savings, and earned the Achievement Medal for Civilian Service.
            </p>
            <p>
              A war refugee who enlisted in the Marine Corps to serve the nation that gave him a second
              chance, Vahidin brings 10+ years of operations research and decision intelligence experience
              supporting multi-billion-dollar defense programs and strategic decisions.
            </p>
            <p>
              He holds a Master of Science in Physics from Wayne State University, where he conducted
              published research in advanced mathematical modeling and applied complex analytical techniques
              to real-world scientific problems.
            </p>
          </div>
        </motion.div>

        {/* ── Impact ──────────────────────────────────────────────────── */}
        <div className="mb-14 md:mb-20">
          <Heading eyebrow="By the Numbers" title="Impact Snapshot" />

          {/* Hairline grid, matching the products and services sections: one
              border, gaps as rules, no floating cards. */}
          <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...reveal(i * 0.07)}
                className="group flex flex-col bg-background p-7 transition-colors duration-200 hover:bg-foreground/[0.02]"
              >
                <stat.icon size={20} className="text-steel" />
                <p className="mt-5 font-display text-4xl font-black leading-none tracking-tight md:text-[2.75rem]">
                  <CountUp
                    to={stat.to}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    className="text-gradient"
                  />
                </p>
                <p className="mt-4 text-sm leading-[1.6] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Career ──────────────────────────────────────────────────── */}
        <div className="mb-14 md:mb-20">
          <Heading eyebrow="Track Record" title="Experience Highlights" />

          <div className="relative">
            {/* The entries are opaque panels, so the rail has to be lifted above
                them explicitly — and the markers above the rail, so each one
                reads as a node on the line rather than a square beside it. */}
            <div className="absolute bottom-8 left-[5px] top-8 z-10 hidden w-px bg-gradient-to-b from-primary/45 via-primary/20 to-transparent md:block" />

            <ol className="border-t border-foreground/[0.07]">
              {career.map((item, i) => (
                <motion.li
                  key={item.title}
                  {...reveal(i * 0.06)}
                  className="group relative bg-background md:pl-10"
                >
                  <span className="absolute left-0 top-[30px] z-20 hidden h-[11px] w-[11px] border border-steel/60 bg-background transition-colors duration-200 group-hover:bg-steel md:block" />
                  <div className="border-b border-foreground/[0.07] py-6 transition-colors duration-200 group-hover:bg-foreground/[0.02] md:pl-6">
                    <h4 className="font-display text-lg font-semibold tracking-tight">{item.title}</h4>
                    <p className="mt-1 text-sm font-medium text-steel/90">{item.role}</p>
                    <p className="mt-3 max-w-3xl text-sm leading-[1.7] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Credentials ─────────────────────────────────────────────── */}
        <div>
          <Heading eyebrow="Credentials" title="Foundation & Research" />

          <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] md:grid-cols-3">
            <motion.div {...reveal()} className="bg-background p-7">
              <GraduationCap size={20} className="text-steel" />
              <h4 className="mt-5 font-display text-base font-semibold tracking-tight">
                Academic Foundation
              </h4>
              <div className="mt-4 space-y-3">
                {education.map((ed) => (
                  <div key={ed.degree}>
                    <p className="text-sm font-medium text-foreground">{ed.degree}</p>
                    <p className="text-xs text-muted-foreground">
                      {ed.school} · {ed.year}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...reveal(0.07)} className="bg-background p-7">
              <BadgeCheck size={20} className="text-steel" />
              <h4 className="mt-5 font-display text-base font-semibold tracking-tight">
                Professional Certifications
              </h4>
              <ul className="mt-4 space-y-2.5">
                {certifications.map((cert) => (
                  <li key={cert} className="text-sm leading-[1.6] text-muted-foreground">
                    {cert}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...reveal(0.14)} className="relative overflow-hidden bg-background p-7">
              {/* The subject of the papers, drawn as its own figure — sat in the
                  corner the heading leaves empty rather than behind the text. */}
              <div className="pointer-events-none absolute right-3 top-3 w-[118px]">
                <EventDisplay />
              </div>
              <FileText size={20} className="relative text-steel" />
              <h4 className="relative mt-5 font-display text-base font-semibold tracking-tight">
                Peer-Reviewed Physics
              </h4>
              <ul className="relative mt-4 space-y-4">
                {publications.map((pub) => (
                  <li key={pub.href} className="border-l border-steel/25 pl-3">
                    <a href={pub.href} target="_blank" rel="noopener noreferrer" className="group/pub block">
                      <span className="block text-sm leading-[1.6] text-muted-foreground transition-colors group-hover/pub:text-foreground">
                        {pub.title}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 font-mono text-[10px] text-steel/70">
                        {pub.authors}
                        <span aria-hidden="true">·</span>
                        {pub.venue}
                        <span className="inline-flex items-center gap-1 uppercase tracking-[0.12em] text-steel transition-colors group-hover/pub:text-primary">
                          {pub.hrefLabel}
                          <ArrowUpRight size={11} />
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
