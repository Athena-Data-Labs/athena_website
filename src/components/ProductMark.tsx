import { productImages } from "@/components/content-icons";

/**
 * A product's mark, in whichever treatment the current theme needs.
 *
 * Two mechanisms, because the products are not in the same position. Thera
 * ships a real light variant — different artwork, generated from the source by
 * its own repo — so it gets both files and CSS picks; that is a swap, and it is
 * the right answer. The others have only the dark drawing, so they fall back to
 * `.brand-art`, which pulls the whole image down the scale until its pale half
 * has somewhere to sit on paper. That is a repair, not a design, and any
 * product that later ships a light mark should be given one here instead.
 *
 * Both images are in the DOM for a two-variant mark rather than one `src`
 * chosen in JS: the theme is not known during the prerendered first paint, so
 * picking in JS means drawing the wrong mark and swapping it a frame later.
 * `loading` is passed through so a hero mark can be eager and a list of them
 * lazy.
 */
const ProductMark = ({
  icon,
  alt,
  className = "",
  loading = "lazy",
  decorative = false,
}: {
  /** Key into `productImages` — the `icon` field on a product in src/content. */
  icon: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Watermarks and marks sitting beside their own name are not content. */
  decorative?: boolean;
}) => {
  const mark = productImages[icon];
  if (!mark) return null;

  const a11y = decorative ? { alt: "", "aria-hidden": true as const } : { alt };

  if (!mark.light) {
    return <img src={mark.dark} {...a11y} loading={loading} className={`brand-art ${className}`} />;
  }

  return (
    <>
      <img src={mark.light} {...a11y} loading={loading} className={`dark:hidden ${className}`} />
      <img src={mark.dark} {...a11y} loading={loading} className={`hidden dark:block ${className}`} />
    </>
  );
};

export default ProductMark;
