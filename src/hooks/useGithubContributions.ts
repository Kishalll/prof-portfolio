import { useEffect, useState } from 'react';

export interface ContribDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  weekday: number;
}

export interface ContribData {
  total: number;
  weeks: ContribDay[][];
}

let cache: Promise<ContribData | null> | null = null;

/** Fetches once per page load; resolves null (never rejects) when the API isn't configured / fails. */
export function loadContributions(): Promise<ContribData | null> {
  if (!cache) {
    cache = fetch('/api/github-contributions')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: ContribData) => (Array.isArray(d?.weeks) && d.weeks.length ? d : null))
      .catch((e) => {
        // Not an error for visitors: without a token the graph simply isn't shown
        console.info('[github graph] hidden –', e instanceof Error ? e.message : e);
        return null;
      });
  }
  return cache;
}

export function useContributions() {
  const [data, setData] = useState<ContribData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let live = true;
    loadContributions().then((d) => {
      if (!live) return;
      setData(d);
      setStatus(d ? 'ready' : 'error');
    });
    return () => {
      live = false;
    };
  }, []);

  return { data, status };
}
