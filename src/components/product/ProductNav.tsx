import { useEffect, useRef, useState } from "react";

export type NavItem = { id: string; label: string };

/**
 * In-page section index for product pages.
 *
 * Product pages run long — demo, rationale, capabilities, price, FAQ — and until
 * now the only way to reach the price was to scroll past everything. This sticks
 * under the navbar and tracks the section in view.
 *
 * The observer band is deliberately narrow (a slice a third of the way down the
 * viewport) so exactly one section is "current" at a time; with a full-height
 * root you get two sections lit at once on tall screens.
 */
const ProductNav = ({ items }: { items: NavItem[] }) => {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        // Topmost section in the band wins, so scrolling up and down agree.
        const top = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b,
        );
        setActive(top.target.id);
      },
      { rootMargin: "-28% 0px -64% 0px", threshold: 0 },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  // Keep the active chip in view on narrow screens, where the bar scrolls.
  useEffect(() => {
    const list = listRef.current;
    const chip = list?.querySelector<HTMLElement>(`[data-nav-id="${active}"]`);
    if (!list || !chip) return;
    const overflowsLeft = chip.offsetLeft < list.scrollLeft;
    const overflowsRight = chip.offsetLeft + chip.offsetWidth > list.scrollLeft + list.clientWidth;
    if (overflowsLeft || overflowsRight) {
      list.scrollTo({ left: chip.offsetLeft - 24, behavior: "smooth" });
    }
  }, [active]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      /* Solid on mobile: at 95% a white heading scrolling underneath still
         ghosts through, and a backdrop-filter on a second fixed bar is a cost
         phones should not pay. Desktop keeps the navbar's blurred treatment. */
      className="sticky top-16 z-30 border-y border-foreground/[0.07] bg-background md:bg-background/75 md:backdrop-blur-xl md:supports-[backdrop-filter]:bg-background/65"
    >
      <div className="container mx-auto px-6">
        <div
          ref={listRef}
          className="-mx-6 flex items-stretch gap-1 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => {
            const on = item.id === active;
            const flush = i === 0;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                data-nav-id={item.id}
                aria-current={on ? "true" : undefined}
                className={`relative shrink-0 whitespace-nowrap py-3.5 pr-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  flush ? "pl-0" : "pl-3"
                } ${on ? "text-primary" : "text-foreground/45 hover:text-foreground/80"}`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 right-3 h-px origin-left bg-primary transition-transform duration-300 ${
                    flush ? "left-0" : "left-3"
                  } ${on ? "scale-x-100" : "scale-x-0"}`}
                />
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default ProductNav;
