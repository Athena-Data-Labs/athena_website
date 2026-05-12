import { motion } from "framer-motion";
import { DollarSign, TrendingUp, BarChart3, Clock, Brain, GraduationCap, FileText, BadgeCheck, Github, Linkedin } from "lucide-react";

const stats = [
  { icon: DollarSign, value: "$1.5B", label: "Cost estimate support for major contract decisions" },
  { icon: TrendingUp, value: "$276.9M", label: "Potential savings identified through modeled alternatives" },
  { icon: BarChart3, value: "$3B+", label: "Lifecycle cost decisions supported through analysis" },
  { icon: Clock, value: "10 Years", label: "Operations research, analytics, and stakeholder delivery" },
];

const career = [
  {
    title: "Department of Defense",
    role: "Senior Data Scientist / Operations Research Analyst · 2016–2026",
    description:
      "Developed cost models and budget forecasts impacting multi-billion-dollar Army programs including the Stryker combat system. Led data validation processes for contract deliverables, earning the Achievement Medal for Civilian Service. Identified $31M in long-term savings through alternative system analysis. Created software for spent plan analysis and congressional review visualizations.",
  },
  {
    title: "MyBudgetNerd",
    role: "Business Intelligence Product · React + FastAPI + AWS",
    description:
      "Designed and built a complete BI system demonstrating intelligent transaction classification, predictive forecasting, anomaly detection, and AI-assisted analysis. Production-deployed on AWS (Amplify + Elastic Beanstalk) with comprehensive ML pipeline and optional AI-enhanced workflows.",
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

const publications = [
  "Probing Early-time Longitudinal Dynamics with the Λ Hyperon's Spin Polarization in Relativistic Heavy-ion Collisions",
  "Orbital Angular Momentum and Fluid Vorticity in Relativistic Heavy Ion Collisions",
];

const FounderSection = () => {
  return (
    <section id="founder" className="relative py-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12 text-center"
        >
          <p className="mb-2 font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Leadership
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Founder & <span className="text-gradient">Technical Lead</span>
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Athena Data Labs
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <a
              href="https://github.com/vahidinj"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Github size={16} /> GitHub
            </a>
          </div>
        </motion.div>

        {/* Pull Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mb-14 max-w-3xl"
        >
          <blockquote className="relative border-l-4 border-primary/60 pl-8 py-4">
            <p className="font-display text-2xl font-bold leading-snug tracking-tight text-foreground md:text-3xl">
              "War refugee. Marine sergeant. Defense analyst.{" "}
              <span className="text-gradient">Now building decision intelligence systems.</span>"
            </p>
          </blockquote>
        </motion.div>

        {/* Bio — two column editorial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mb-16 max-w-4xl grid gap-8 md:grid-cols-2"
        >
          <div className="space-y-5">
            <p className="text-lg leading-[1.8] text-muted-foreground">
              Vahidin Jupic founded Athena Data Labs to build decision-grade intelligence systems: business intelligence
              dashboards, AI agents, and analytics that transform data into confident action.
            </p>
            <p className="text-lg leading-[1.8] text-muted-foreground">
              A war refugee who enlisted in the Marine Corps to serve the nation that gave him a second
              chance, Vahidin brings 10+ years of operations research and decision intelligence experience
              supporting multi-billion-dollar defense programs and strategic decisions.
            </p>
          </div>
          <div className="space-y-5">
            <p className="text-lg leading-[1.8] text-muted-foreground">
              His analytical work has informed critical decisions supporting $3B+ in strategic planning,
              identified $276.9M in potential savings, and earned the Achievement Medal for
              Civilian Service.
            </p>
            <p className="text-lg leading-[1.8] text-muted-foreground">
              He holds a Master of Science in Physics from Wayne State University, where he conducted
              published research in advanced mathematical modeling and applied complex analytical techniques
              to real-world scientific problems.
            </p>
          </div>
        </motion.div>

        {/* Impact Stats — dramatic editorial numbers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <h3 className="mb-8 text-center font-display text-2xl font-bold tracking-tight">
            Impact Snapshot
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="card-gradient rounded-xl border border-border/50 p-6 text-center"
              >
                <div className="mx-auto mb-3 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <stat.icon size={22} />
                </div>
                <p className="font-display text-4xl font-black text-gradient leading-none md:text-5xl">{stat.value}</p>
                <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Career Highlights — with timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <h3 className="mb-8 text-center font-display text-2xl font-bold tracking-tight">
            Experience Highlights
          </h3>
          <div className="mx-auto max-w-3xl relative">
            {/* Gold timeline line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent hidden md:block" />
            
            <div className="space-y-5">
              {career.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  className="relative md:pl-12"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-[14px] top-7 w-[11px] h-[11px] rounded-full border-2 border-primary/60 bg-background hidden md:block" />
                  
                  <div className="card-gradient rounded-xl border border-border/50 p-6">
                    <h4 className="font-display text-lg font-semibold">{item.title}</h4>
                    <p className="mt-1 text-sm font-medium text-primary">{item.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Education, Certifications, Publications */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="card-gradient rounded-xl border border-border/50 p-6"
          >
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
              <GraduationCap size={22} />
            </div>
              <h4 className="mb-4 font-display text-lg font-semibold">Academic Foundation</h4>
            <div className="space-y-3">
              {education.map((ed) => (
                <div key={ed.degree}>
                  <p className="text-sm font-medium text-foreground">{ed.degree}</p>
                  <p className="text-xs text-muted-foreground">{ed.school} · {ed.year}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="card-gradient rounded-xl border border-border/50 p-6"
          >
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
              <BadgeCheck size={22} />
            </div>
              <h4 className="mb-4 font-display text-lg font-semibold">Professional Certifications</h4>
            <ul className="space-y-2">
              {certifications.map((cert) => (
                <li key={cert} className="text-sm text-muted-foreground">{cert}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="card-gradient rounded-xl border border-border/50 p-6"
          >
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
              <FileText size={22} />
            </div>
            <h4 className="mb-4 font-display text-lg font-semibold">Publications</h4>
            <ul className="space-y-2">
              {publications.map((pub) => (
                <li key={pub} className="text-sm leading-relaxed text-muted-foreground">{pub}</li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Core Expertise */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
          className="mx-auto max-w-3xl rounded-xl border border-primary/20 card-gradient p-8 text-center"
        >
          <div className="mx-auto mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
            <Brain size={24} />
          </div>
          <h3 className="mb-4 font-display text-2xl font-bold tracking-tight">Core Expertise</h3>
          <p className="leading-relaxed text-muted-foreground">
            Business intelligence and decision science across forecasting, anomaly detection, and intelligent automation.
            Delivered through rigorous analysis, clear data narratives, and AI-assisted insights that turn metrics into confident action.
            Built in Python and SQL with modern ML and agent frameworks when they measurably improve outcomes.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FounderSection;
