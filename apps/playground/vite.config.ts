import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = dirname(fileURLToPath(import.meta.url));

// The playground runs @agentmirror/core in the browser — alias it to the TS
// source so the page builds straight from the engine, no prebuild needed.
// `base: './'` keeps asset paths relative so the static build deploys anywhere
// (GitHub Pages, Vercel, Netlify).
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@agentmirror/core': resolve(root, '../../packages/core/src/index.ts'),
    },
  },
});
