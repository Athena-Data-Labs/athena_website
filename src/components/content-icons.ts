/**
 * Resolves the string icon keys used in src/content (kept pure for Node scripts)
 * to actual images and lucide components.
 */
import { BarChart3, BrainCircuit, LayoutDashboard, Network, Table, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import aegisIcon from "@/assets/aegis-bi-icon.webp";
import glaukosIcon from "@/assets/glaukos-icon.webp";
import myBudgetNerdIcon from "@/assets/mybudgetnerd-icon.webp";
import theraMark from "@/assets/thera-mark.png";
import theraMarkLight from "@/assets/thera-mark-light.png";

/**
 * Product marks.
 *
 * `dark` is the artwork as drawn — every one of these was made for a near-black
 * ground. `light` is a prepared variant where the product ships one, and it is
 * not the same file recoloured by us: Thera's is the "ALT / LIGHT" treatment
 * from its own brand guide, generated from the source art by a script in that
 * repo, with the wolf taken to near-black and the ring left gold. Where `light`
 * is absent the mark is filtered down at render time instead, which is a
 * weaker answer — see `.brand-art` in index.css.
 *
 * Both are declared here rather than at the call sites so a new placement
 * cannot quietly ship the dark mark onto paper. Render through <ProductMark>.
 */
export type ProductMark = { dark: string; light?: string };

export const productImages: Record<string, ProductMark | undefined> = {
  aegis: { dark: aegisIcon },
  glaukos: { dark: glaukosIcon },
  mybudgetnerd: { dark: myBudgetNerdIcon },
  thera: { dark: theraMark, light: theraMarkLight },
  ann: undefined,
};

/** Lucide fallbacks for products without a raster icon, and service icons. */
export const contentIcons: Record<string, LucideIcon> = {
  ann: BrainCircuit,
  "bar-chart": BarChart3,
  zap: Zap,
  "layout-dashboard": LayoutDashboard,
  "trending-up": TrendingUp,
  table: Table,
  network: Network,
};
