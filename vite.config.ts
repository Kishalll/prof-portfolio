import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { handleContributionsRequest } from './server/githubContributions';

/**
 * Dev-only: serves /api/github-contributions from the Vite dev server so the graph works with
 * `npm run dev`. GITHUB_TOKEN is read from .env on the server side and never sent to the browser.
 * (Restart the dev server after editing .env.)
 */
const githubContributionsDev = (env: Record<string, string>): Plugin => ({
  name: 'github-contributions-dev',
  configureServer(server) {
    server.middlewares.use('/api/github-contributions', async (_req, res) => {
      const r = await handleContributionsRequest(env);
      res.statusCode = r.status;
      Object.entries(r.headers).forEach(([k, v]) => res.setHeader(k, v));
      res.end(r.body);
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), githubContributionsDev(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
  };
});
