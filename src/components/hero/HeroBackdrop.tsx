import React, { useMemo } from 'react';

export type HeroBackdropVariant =
  | 'none'
  | 'aurora'
  | 'grid'
  | 'beams'
  | 'halftone'
  | 'waves'
  | 'hex'
  | 'network'
  | 'code'
  | 'mesh';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PICK THE HERO BACKGROUND:  change HERO_BACKDROP below to one of
 *  'aurora' | 'grid' | 'beams' | 'halftone' | 'waves' | 'hex' | 'network' | 'code' | 'mesh' | 'none'
 *  (On localhost you can preview any of them with  http://localhost:5173/?bg=hex )
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const HERO_BACKDROP: HeroBackdropVariant = 'aurora';

const KIWI = '204,255,0';

// Fade every edge so the scene melts into the page instead of showing a box
const edgeMaskImage =
  'linear-gradient(to right, transparent, #000 14%, #000 90%, transparent), linear-gradient(to bottom, transparent, #000 12%, #000 68%, transparent)';
const edgeMask = {
  WebkitMaskImage: edgeMaskImage,
  maskImage: edgeMaskImage,
  WebkitMaskComposite: 'source-in',
  maskComposite: 'intersect',
} as React.CSSProperties;

/* ---- 1. Aurora: soft glowing colour clouds, strongest behind the photo ---- */
const Aurora: React.FC = () => (
  <>
    <div
      className="absolute -top-20 -right-10 w-[560px] h-[560px] rounded-full blur-[110px] opacity-45"
      style={{ background: `radial-gradient(circle, rgb(${KIWI}) 0%, transparent 65%)` }}
    />
    <div
      className="absolute top-24 right-[22%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-30"
      style={{ background: 'radial-gradient(circle, #00FFC2 0%, transparent 65%)' }}
    />
    <div
      className="absolute bottom-0 -left-16 w-[420px] h-[320px] rounded-full blur-[110px] opacity-20"
      style={{ background: 'radial-gradient(circle, #7BFF3A 0%, transparent 65%)' }}
    />
  </>
);

/* ---- 2. Grid: glowing perspective floor, like a horizon ---- */
const Grid: React.FC = () => (
  <>
    <div
      className="absolute inset-x-0 bottom-0 h-[70%] overflow-hidden"
      style={{ perspective: '520px' }}
    >
      <div
        className="absolute left-[-50%] right-[-50%] bottom-[-10%] h-[200%] origin-bottom"
        style={{
          transform: 'rotateX(64deg)',
          backgroundImage: `linear-gradient(rgba(${KIWI},.5) 1px, transparent 1px), linear-gradient(90deg, rgba(${KIWI},.5) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          WebkitMaskImage: 'linear-gradient(to top, #000 10%, transparent 70%)',
          maskImage: 'linear-gradient(to top, #000 10%, transparent 70%)',
        }}
      />
    </div>
    <div
      className="absolute inset-x-0 bottom-0 h-40 opacity-40"
      style={{ background: `radial-gradient(ellipse 60% 100% at 50% 100%, rgba(${KIWI},.45), transparent 70%)` }}
    />
    <div
      className="absolute -top-16 right-0 w-[420px] h-[420px] rounded-full blur-[100px] opacity-25"
      style={{ background: `radial-gradient(circle, rgb(${KIWI}) 0%, transparent 65%)` }}
    />
  </>
);

/* ---- 4. Beams: light rays from the top-right corner + faint scanlines ---- */
const Beams: React.FC = () => (
  <>
    <div
      className="absolute inset-0 blur-[14px] opacity-90"
      style={{
        background: `conic-gradient(from 188deg at 92% -12%, transparent 0deg, rgba(${KIWI},.20) 7deg, transparent 17deg, rgba(${KIWI},.12) 26deg, transparent 38deg, rgba(${KIWI},.08) 50deg, transparent 64deg)`,
        WebkitMaskImage: 'linear-gradient(to bottom left, #000 20%, transparent 85%)',
        maskImage: 'linear-gradient(to bottom left, #000 20%, transparent 85%)',
      }}
    />
    <div
      className="absolute -top-24 right-0 w-[380px] h-[300px] rounded-full blur-[90px] opacity-35"
      style={{ background: `rgb(${KIWI})` }}
    />
    <div
      className="absolute inset-0 opacity-70"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 4px)',
      }}
    />
  </>
);

/* ---------- helpers for the generated scenes (all deterministic: same picture every load) ---------- */
const SCENE_W = 1024;
const SCENE_H = 680;
// Where the portrait's centre sits inside the backdrop (desktop layout)
const PX = 884;
const PY = 241;

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const leftFade = (from: string, to: string) =>
  ({
    WebkitMaskImage: `linear-gradient(to right, transparent ${from}, #000 ${to})`,
    maskImage: `linear-gradient(to right, transparent ${from}, #000 ${to})`,
  }) as React.CSSProperties;

const SceneSvg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg
    viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
    className="absolute right-0 top-0 max-w-none"
    style={{ width: SCENE_W, height: SCENE_H, ...style }}
    fill="none"
  >
    {children}
  </svg>
);

/* ---- 6. Halftone: dots swell toward the portrait, like a printed gradient ---- */
const Halftone: React.FC = () => {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = [];
    for (let y = 10; y < SCENE_H; y += 18) {
      for (let x = (Math.round(y / 18) % 2) * 9; x < SCENE_W; x += 18) {
        const r = 4.2 * Math.exp(-Math.hypot(x - PX, y - PY) / 250);
        if (r > 0.55) out.push({ x, y, r });
      }
    }
    return out;
  }, []);
  return (
    <>
      <SceneSvg>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r.toFixed(2)} fill={`rgba(${KIWI},.55)`} />
        ))}
      </SceneSvg>
      <div
        className="absolute top-0 right-[4%] w-[380px] h-[380px] rounded-full blur-[110px] opacity-20"
        style={{ background: `rgb(${KIWI})` }}
      />
    </>
  );
};

/* ---- 7. Waves: flowing signal lines that fan out toward the right ---- */
const Waves: React.FC = () => {
  const lines = useMemo(() => {
    const out: { d: string; o: number; w: number }[] = [];
    const n = 26;
    for (let i = 0; i < n; i++) {
      const k = (i - n / 2) / (n / 2); // -1 .. 1
      let d = '';
      for (let x = 0; x <= SCENE_W; x += 12) {
        const t = x / SCENE_W;
        const spread = 40 + t * 230;
        const y = 300 + k * spread + Math.sin(x / 120 + i * 0.28) * (6 + 30 * t) * (1 - Math.abs(k) * 0.4);
        d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)}`;
      }
      out.push({ d, o: 0.42 - Math.abs(k) * 0.3, w: i % 6 === 0 ? 1.5 : 1 });
    }
    return out;
  }, []);
  return (
    <>
      <SceneSvg style={leftFade('15%', '70%')}>
        {lines.map((l, i) => (
          <path key={i} d={l.d} stroke={`rgba(${KIWI},${l.o.toFixed(2)})`} strokeWidth={l.w} />
        ))}
      </SceneSvg>
      <div
        className="absolute top-10 right-[2%] w-[420px] h-[360px] rounded-full blur-[110px] opacity-25"
        style={{ background: `rgb(${KIWI})` }}
      />
    </>
  );
};

/* ---- 8. Hex: honeycomb that lights up around the portrait ---- */
const Hex: React.FC = () => {
  const cells = useMemo(() => {
    const r = 26;
    const rand = rng(7);
    const out: { pts: string; stroke: number; fill: number }[] = [];
    const dx = 1.5 * r;
    const dy = Math.sqrt(3) * r;
    for (let c = 0; c * dx < SCENE_W + r; c++) {
      for (let row = 0; row * dy < SCENE_H + dy; row++) {
        const cx = c * dx;
        const cy = row * dy + (c % 2 ? dy / 2 : 0);
        const d = Math.hypot(cx - PX, cy - PY);
        const stroke = Math.max(0, 0.3 - d / 2300);
        if (stroke < 0.04) continue;
        const pts = Array.from({ length: 6 }, (_, k) => {
          const a = (Math.PI / 3) * k;
          return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
        }).join(' ');
        const lit = d < 430 && rand() < 0.16;
        out.push({ pts, stroke, fill: lit ? 0.05 + rand() * 0.12 : 0 });
      }
    }
    return out;
  }, []);
  return (
    <>
      <SceneSvg>
        {cells.map((c, i) => (
          <polygon
            key={i}
            points={c.pts}
            stroke={`rgba(${KIWI},${c.stroke.toFixed(2)})`}
            strokeWidth="1"
            fill={c.fill ? `rgba(${KIWI},${c.fill.toFixed(2)})` : 'none'}
          />
        ))}
      </SceneSvg>
      <div
        className="absolute top-0 right-[6%] w-[340px] h-[340px] rounded-full blur-[100px] opacity-20"
        style={{ background: `rgb(${KIWI})` }}
      />
    </>
  );
};

/* ---- 9. Network: a neural-net / node graph (fits the Applied AI angle) ---- */
const Network: React.FC = () => {
  const { nodes, edges } = useMemo(() => {
    const rand = rng(21);
    const pts: { x: number; y: number; big: boolean }[] = [];
    for (let i = 0; i < 54; i++) {
      pts.push({ x: 260 + rand() * (SCENE_W - 260), y: 10 + rand() * (SCENE_H - 40), big: rand() < 0.22 });
    }
    const e: { x1: number; y1: number; x2: number; y2: number; o: number }[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 150) e.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[j].x, y2: pts[j].y, o: 0.26 * (1 - d / 150) + 0.04 });
      }
    }
    return { nodes: pts, edges: e };
  }, []);
  return (
    <>
      <SceneSvg style={leftFade('8%', '48%')}>
        {edges.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={`rgba(${KIWI},${e.o.toFixed(2)})`} strokeWidth="1" />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            {n.big && <circle cx={n.x} cy={n.y} r="9" fill={`rgba(${KIWI},.12)`} />}
            <circle cx={n.x} cy={n.y} r={n.big ? 3.2 : 1.8} fill={`rgba(${KIWI},${n.big ? 0.9 : 0.5})`} />
          </g>
        ))}
      </SceneSvg>
      <div
        className="absolute top-8 right-[6%] w-[360px] h-[320px] rounded-full blur-[110px] opacity-20"
        style={{ background: `rgb(${KIWI})` }}
      />
    </>
  );
};

/* ---- 10. Code rain: faint falling binary / hex columns ---- */
const CodeRain: React.FC = () => {
  const cols = useMemo(() => {
    const rand = rng(99);
    const glyphs = '01010011ABCDEF<>/{}[];=+*';
    return Array.from({ length: 46 }, (_, i) => ({
      x: i * 22,
      o: 0.1 + rand() * 0.28,
      top: -Math.floor(rand() * 120),
      text: Array.from({ length: 34 }, () => glyphs[Math.floor(rand() * glyphs.length)]).join(''),
    }));
  }, []);
  return (
    <>
      <div className="absolute inset-0" style={leftFade('25%', '85%')}>
        {cols.map((c, i) => (
          <div
            key={i}
            className="absolute font-mono text-[11px] leading-[14px] select-none"
            style={{
              left: c.x,
              top: c.top,
              color: `rgba(${KIWI},${c.o.toFixed(2)})`,
              writingMode: 'vertical-rl',
              textOrientation: 'upright',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 30%, #000 60%, transparent)',
              maskImage: 'linear-gradient(to bottom, transparent, #000 30%, #000 60%, transparent)',
            }}
          >
            {c.text}
          </div>
        ))}
      </div>
      <div
        className="absolute top-0 right-[4%] w-[360px] h-[360px] rounded-full blur-[110px] opacity-20"
        style={{ background: `rgb(${KIWI})` }}
      />
    </>
  );
};

/* ---- 11. Mesh + grain: bold multi-colour gradient with film grain ---- */
const MeshGrain: React.FC = () => (
  <>
    <div
      className="absolute -top-24 -right-16 w-[620px] h-[560px] rounded-full blur-[100px] opacity-50"
      style={{ background: `radial-gradient(circle at 40% 40%, rgb(${KIWI}) 0%, transparent 62%)` }}
    />
    <div
      className="absolute top-40 right-[28%] w-[420px] h-[420px] rounded-full blur-[110px] opacity-40"
      style={{ background: 'radial-gradient(circle, #00E5C0 0%, transparent 65%)' }}
    />
    <div
      className="absolute -bottom-10 right-[8%] w-[460px] h-[360px] rounded-full blur-[110px] opacity-35"
      style={{ background: 'radial-gradient(circle, #5B4BFF 0%, transparent 65%)' }}
    />
    <svg className="absolute inset-0 w-full h-full mix-blend-overlay opacity-40" aria-hidden="true">
      <filter id="hero-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#hero-grain)" />
    </svg>
  </>
);

const VARIANTS: Record<Exclude<HeroBackdropVariant, 'none'>, React.FC> = {
  aurora: Aurora,
  grid: Grid,
  beams: Beams,
  halftone: Halftone,
  waves: Waves,
  hex: Hex,
  network: Network,
  code: CodeRain,
  mesh: MeshGrain,
};

const resolveVariant = (): HeroBackdropVariant => {
  if (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    const q = new URLSearchParams(window.location.search).get('bg');
    if (q && (q === 'none' || q in VARIANTS)) return q as HeroBackdropVariant;
  }
  return HERO_BACKDROP;
};

/** Decorative layer behind the hero content. Purely visual: no pointer events, hidden from AT. */
export const HeroBackdrop: React.FC = () => {
  const variant = resolveVariant();
  if (variant === 'none') return null;
  const Scene = VARIANTS[variant];
  return (
    <div
      className="absolute -inset-x-4 sm:-inset-x-6 -top-14 -bottom-10 overflow-hidden pointer-events-none z-0"
      style={edgeMask}
      aria-hidden="true"
    >
      <Scene />
    </div>
  );
};
