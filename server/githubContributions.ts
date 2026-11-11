/**
 * GitHub contribution calendar, fetched server-side so the token never reaches the browser.
 *
 * Used by:
 *   - vite.config.ts                       (dev server:  /api/github-contributions)
 *   - api/github-contributions.ts          (Vercel)
 *   - netlify/functions/github-contributions.ts (Netlify)
 *
 * Environment variables (NO "VITE_" prefix - those would be bundled into the public site):
 *   GITHUB_TOKEN     required. Any personal access token works for public contributions.
 *   GITHUB_USERNAME  optional. Defaults to the account linked in the hero ("Kishalll").
 *   GITHUB_RANGE     optional. "rolling" (default, last 12 months) or "year" (1 Jan -> today).
 */

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

export interface ContribEnv {
  GITHUB_TOKEN?: string;
  GITHUB_USERNAME?: string;
  GITHUB_RANGE?: string;
}

export interface ContribResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

const DEFAULT_USERNAME = 'Kishalll';

const QUERY = `
query($login: String!, $from: DateTime, $to: DateTime) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel weekday } }
      }
    }
  }
}`;

const LEVELS: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const json = (status: number, payload: unknown, cache: string): ContribResponse => ({
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
  body: JSON.stringify(payload),
});

export async function handleContributionsRequest(env: ContribEnv): Promise<ContribResponse> {
  const token = env.GITHUB_TOKEN?.trim();
  if (!token) return json(500, { error: 'GITHUB_TOKEN is not set' }, 'no-store');

  const login = env.GITHUB_USERNAME?.trim() || DEFAULT_USERNAME;
  const variables: Record<string, string> = { login };
  if ((env.GITHUB_RANGE || '').toLowerCase() === 'year') {
    const now = new Date();
    variables.from = `${now.getUTCFullYear()}-01-01T00:00:00Z`;
    variables.to = now.toISOString();
  }

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-contribution-graph',
      },
      body: JSON.stringify({ query: QUERY, variables }),
    });
    if (!res.ok) return json(502, { error: `GitHub responded ${res.status}` }, 'no-store');

    const payload = (await res.json()) as any;
    const cal = payload?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) {
      const msg = payload?.errors?.[0]?.message || 'user or calendar not found';
      return json(502, { error: msg }, 'no-store');
    }

    const data: ContribData = {
      total: cal.totalContributions,
      weeks: cal.weeks.map((w: any) =>
        w.contributionDays.map((d: any) => ({
          date: d.date,
          count: d.contributionCount,
          level: LEVELS[d.contributionLevel] ?? 0,
          weekday: d.weekday,
        }))
      ),
    };
    // Cache at the edge for an hour; GitHub's own graph isn't real-time either
    return json(200, data, 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
  } catch (e) {
    return json(502, { error: e instanceof Error ? e.message : 'request failed' }, 'no-store');
  }
}
