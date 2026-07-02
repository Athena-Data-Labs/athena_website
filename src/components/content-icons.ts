/**
 * Resolves the string icon keys used in src/content (kept pure for Node scripts)
 * to actual images and lucide components.
 */
import { BarChart3, BrainCircuit, LayoutDashboard, Network, Table, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import aegisIcon from "@/assets/aegis-bi-icon.webp";
import glaukosIcon from "@/assets/glaukos-icon.webp";
import myBudgetNerdIcon from "@/assets/mybudgetnerd-icon.webp";

/** Product icon images (webp with transparency). "ann" has no image — falls back to a lucide icon. */
export const productImages: Record<string, string | undefined> = {
  aegis: aegisIcon,
  glaukos: glaukosIcon,
  mybudgetnerd: myBudgetNerdIcon,
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
