import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hairline progress bar under the navbar. Earns its place on long-form pages —
 * a charter, a case study, an engineering note — where "how much is left" is a
 * real question. Two pixels of gold, no numbers, nothing to read.
 */
const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.4 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed left-0 right-0 top-16 z-40 h-[2px] origin-left bg-steel/70"
    />
  );
};

export default ReadingProgress;
