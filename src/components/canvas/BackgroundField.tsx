import React from 'react';
import { WaveBackground } from './WaveBackground';
import { HexBackground } from './HexBackground';

/**
 * Picks the site-wide animated background.
 *
 *   .env  →  VITE_BACKGROUND_STYLE=waves       (default)
 *            VITE_BACKGROUND_STYLE=honeycomb
 *            VITE_BACKGROUND_STYLE=none
 *
 * Restart `npm run dev` after editing .env (Vite reads it at startup). For a quick look on
 * localhost you can also append  ?bg=honeycomb  or  ?bg=waves  to the URL.
 */
type Style = 'waves' | 'honeycomb' | 'none';

const normalise = (value: string | null | undefined): Style | null => {
  const v = (value ?? '').trim().toLowerCase();
  if (v === 'waves' || v === 'wave') return 'waves';
  if (v === 'honeycomb' || v === 'hex') return 'honeycomb';
  if (v === 'none' || v === 'off') return 'none';
  return null;
};

const resolveStyle = (): Style => {
  if (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    const q = normalise(new URLSearchParams(window.location.search).get('bg'));
    if (q) return q;
  }
  return normalise(import.meta.env.VITE_BACKGROUND_STYLE) ?? 'waves';
};

export const BackgroundField: React.FC = () => {
  const style = resolveStyle();
  if (style === 'honeycomb') return <HexBackground />;
  if (style === 'waves') return <WaveBackground />;
  return null;
};
