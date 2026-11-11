// Vercel serverless function  ->  GET /api/github-contributions
// Set GITHUB_TOKEN (and optionally GITHUB_USERNAME, GITHUB_RANGE) in Project Settings -> Environment Variables.
import { handleContributionsRequest } from '../server/githubContributions';

declare const process: { env: Record<string, string | undefined> };

export async function GET(): Promise<Response> {
  const r = await handleContributionsRequest(process.env);
  return new Response(r.body, { status: r.status, headers: r.headers });
}
