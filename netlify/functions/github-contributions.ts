// Netlify function  ->  GET /api/github-contributions
// Set GITHUB_TOKEN (and optionally GITHUB_USERNAME, GITHUB_RANGE) in Site settings -> Environment variables.
import { handleContributionsRequest } from '../../server/githubContributions';

declare const process: { env: Record<string, string | undefined> };

export default async (): Promise<Response> => {
  const r = await handleContributionsRequest(process.env);
  return new Response(r.body, { status: r.status, headers: r.headers });
};

export const config = { path: '/api/github-contributions' };
