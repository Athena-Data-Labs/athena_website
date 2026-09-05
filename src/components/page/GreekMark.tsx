import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

export type GreekTerm = {
  /** The word itself, in Greek. */
  word: string;
  /** Latin transliteration, with macrons where the Greek vowel is long. */
  roman: string;
  /** A word or short phrase of English. */
  gloss: string;
};

/**
 * The house device, after Aletheia: each landing page is anchored to the Greek
 * word behind what it does. The mark is uncovered by a wipe rather than faded
 * in — the same gesture ἀλήθεια uses, since "unconcealment" is the idea the
 * whole system is built on.
 *
 * Landing pages only. Detail pages are for reading and get nothing.
 */
const GreekMark = ({ term }: { term: GreekTerm }) => (
  <motion.p
    initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
    animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
    transition={{ duration: 1.5, delay: 0.35, ease: EASE }}
    lang="grc"
    aria-hidden="true"
    className="greek-watermark pointer-events-none absolute right-[4%] top-1/2 hidden -translate-y-1/2 select-none whitespace-nowrap font-display text-[8.5vw] font-light leading-none tracking-[0.01em] lg:block"
  >
    {term.word}
  </motion.p>
);

/**
 * The reading of the mark, set small next to the page's own eyebrow.
 *
 * Only the word itself is tagged `grc`: the transliteration and the gloss are
 * meant to be read as English, and tagging the whole line would have a screen
 * reader attempt ancient Greek pronunciation on all three.
 */
export const GreekGloss = ({ term }: { term: GreekTerm }) => (
  <span className="font-mono text-[10px] normal-case tracking-[0.18em] text-steel">
    <span lang="grc">{term.word}</span> · {term.roman} · {term.gloss}
  </span>
);

export default GreekMark;
