import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit } from "lucide-react";
import aegisIcon from "@/assets/aegis-bi-icon.png";
import myBudgetNerdIcon from "@/assets/mybudgetnerd-icon.png";

type Product = {
  img?: string;
  Icon?: typeof BrainCircuit;
  name: string;
  tag: string;
  desc: string;
};

const products: Product[] = [
  {
    img: aegisIcon,
    name: "Aegis BI",
    tag: "Flagship · Live",
    desc: "AI-assisted financial intelligence — command-center dashboards, cash & revenue forecasting, what-if scenarios, and the Glaukos AI analyst.",
  },
  {
    img: myBudgetNerdIcon,
    name: "MyBudgetNerd",
    tag: "iOS · On the App Store",
    desc: "A shipped consumer finance product — PDF statement parsing, ML transaction categorization, forecasting, and anomaly detection.",
  },
  {
    Icon: BrainCircuit,
    name: "ANN Builder Studio",
    tag: "Interactive · Live",
    desc: "A hands-on neural-network workspace — explore and clean data, design and train models, then export predictions.",
  },
];

const ProofTeaser = () => {
  return (
    <section id="products" className="relative border-b border-white/[0.06] py-12 md:py-20 bg-[#0a0c10]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 md:mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              <span className="h-3 w-[2px] shrink-0 bg-primary" />
              Proof of Delivery
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Products We&apos;ve Built &amp; Shipped
            </h2>
            <div className="mt-3 h-px w-16 bg-primary/40" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Real, in-production intelligence products — from a flagship BI platform to a
              consumer app on the App Store. Explore the live demos and case studies in Athena Labs.
            </p>
          </div>
          <Link
            to="/labs"
            data-umami-event="explore-labs"
            className="inline-flex shrink-0 items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Explore Athena Labs <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] md:grid-cols-3">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Link
                to="/labs"
                className="group flex h-full flex-col bg-[#0a0c10] p-7 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  {p.img ? (
                    <img
                      src={p.img}
                      alt={`${p.name} icon`}
                      className="h-11 w-11 shrink-0 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    p.Icon && (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/25 text-primary">
                        <p.Icon size={22} />
                      </div>
                    )
                  )}
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
                      {p.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/70">
                      <span className="h-1 w-1 rounded-full bg-primary" /> {p.tag}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-[1.65] text-muted-foreground">
                  {p.desc}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary/70 transition-colors group-hover:text-primary">
                  View in Labs <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProofTeaser;
