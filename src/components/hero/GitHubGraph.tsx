import React, { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ContribData } from '../../hooks/useGithubContributions';

interface GitHubGraphProps {
  data: ContribData | null; // null while loading -> dim skeleton grid
  style?: React.CSSProperties;
}

const LEVEL_CLASS = [
  'bg-white/[0.06]',
  'bg-kiwi/25',
  'bg-kiwi/50',
  'bg-kiwi/75',
  'bg-kiwi shadow-[0_0_6px_rgba(204,255,0,0.45)]',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SKELETON_WEEKS = 53;

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

/**
 * Contribution graph (no heading). Phones: fixed-size cells, scrolls sideways, opens on the latest
 * weeks so earlier months are a swipe to the left. sm+: all weeks stretch to fill the card.
 * The scroll box carries data-gh-sweep so the hero build can wipe it in left -> right.
 */
export const GitHubGraph = forwardRef<HTMLDivElement, GitHubGraphProps>(({ data, style }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const weeks = data?.weeks;
  const n = weeks?.length ?? SKELETON_WEEKS;

  const monthLabels = useMemo(() => {
    if (!weeks) return [];
    const out: { col: number; label: string }[] = [];
    let lastMonth = -1;
    let lastCol = -10;
    weeks.forEach((w, i) => {
      if (!w.length) return;
      const m = Number(w[0].date.slice(5, 7)) - 1;
      if (m !== lastMonth && i - lastCol >= 3 && i <= weeks.length - 2) {
        out.push({ col: i, label: MONTHS[m] });
        lastCol = i;
      }
      lastMonth = m;
    });
    return out;
  }, [weeks]);

  // Open on the most recent weeks
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
    setCanScrollLeft(el.scrollLeft > 2);
  }, [data]);

  const showTip = (e: React.SyntheticEvent) => {
    const cell = (e.target as HTMLElement).closest('[data-d]') as HTMLElement | null;
    const host = (e.currentTarget as HTMLElement).closest('[data-gh-root]') as HTMLElement | null;
    if (!cell || !host) return;
    const c = cell.getBoundingClientRect();
    const h = host.getBoundingClientRect();
    const count = Number(cell.dataset.c);
    const text = `${count === 0 ? 'No contributions' : `${count} contribution${count === 1 ? '' : 's'}`} on ${fmt(cell.dataset.d!)}`;
    const half = 90;
    const x = Math.min(Math.max(c.left - h.left + c.width / 2, half), h.width - half);
    setTip({ x, y: c.top - h.top - 6, text });
  };

  const label = data ? `GitHub contribution graph: ${data.total} contributions in the last year` : 'GitHub contribution graph';

  return (
    <div
      ref={ref}
      data-gh-root
      style={style}
      role="img"
      aria-label={label}
      className="relative rounded-xl border border-kiwi-border bg-black/70 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-4"
    >
      <div
        ref={scrollRef}
        data-gh-sweep
        onScroll={(e) => {
          setCanScrollLeft(e.currentTarget.scrollLeft > 2);
          setTip(null);
        }}
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="[--gh-cell:11px] [--gh-gap:3px] sm:[--gh-cell:6px] sm:[--gh-gap:4px] w-full"
          style={
            {
              '--n': n,
              minWidth: 'calc(var(--n) * (var(--gh-cell) + var(--gh-gap)))',
            } as React.CSSProperties
          }
        >
          {/* month labels */}
          <div
            aria-hidden="true"
            className="grid mb-1.5 h-3.5"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(var(--gh-cell), 1fr))`, columnGap: 'var(--gh-gap)' }}
          >
            {monthLabels.map((m) => (
              <span
                key={m.col}
                className="block w-0 whitespace-nowrap font-mono text-[10px] leading-3.5 text-zinc-400"
                style={{ gridColumn: m.col + 1, gridRow: 1 }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* cells */}
          <div
            aria-hidden="true"
            className={`grid ${data ? '' : 'animate-pulse'}`}
            style={{
              gridTemplateColumns: `repeat(${n}, minmax(var(--gh-cell), 1fr))`,
              gridTemplateRows: 'repeat(7, auto)',
              gap: 'var(--gh-gap)',
            }}
            onPointerOver={data ? showTip : undefined}
            onPointerDown={data ? showTip : undefined}
            onPointerLeave={() => setTip(null)}
          >
            {data
              ? data.weeks.flatMap((w, wi) =>
                  w.map((d) => (
                    <i
                      key={d.date}
                      data-d={d.date}
                      data-c={d.count}
                      className={`block aspect-square rounded-[3px] transition-colors duration-500 ${LEVEL_CLASS[d.level]}`}
                      style={{ gridColumn: wi + 1, gridRow: d.weekday + 1 }}
                    />
                  ))
                )
              : Array.from({ length: SKELETON_WEEKS * 7 }, (_, i) => (
                  <i
                    key={i}
                    className={`block aspect-square rounded-[3px] ${LEVEL_CLASS[0]}`}
                    style={{ gridColumn: Math.floor(i / 7) + 1, gridRow: (i % 7) + 1 }}
                  />
                ))}
          </div>
        </div>
      </div>

      {/* fade hint: earlier months are to the left */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-3 sm:left-4 top-3 bottom-8 w-8 bg-gradient-to-r from-black/90 to-transparent transition-opacity duration-300 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* legend */}
      <div aria-hidden="true" className="mt-2.5 flex items-center justify-end gap-1.5 font-mono text-[10px] text-zinc-500">
        <span>Less</span>
        {LEVEL_CLASS.map((c, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-[3px] ${c}`} />
        ))}
        <span>More</span>
      </div>

      {tip && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-kiwi-borderBright bg-black px-2 py-1 font-mono text-[11px] text-zinc-200"
          style={{ left: tip.x, top: tip.y }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
});
GitHubGraph.displayName = 'GitHubGraph';
