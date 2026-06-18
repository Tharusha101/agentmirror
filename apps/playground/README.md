# @agentmirror/playground

A browser playground for AgentMirror. Paste an `AGENTS.md`, see every tool's mirror generated live and linted — all client-side, running the real [`@agentmirror/core`](../../packages/core) engine (it's pure, no I/O, so it runs in the browser unchanged). Nothing is uploaded.

```bash
npm run dev -w @agentmirror/playground      # local dev server
npm run build -w @agentmirror/playground    # static build -> apps/playground/dist
```

The build is plain static files (`base: './'`), so it deploys to GitHub Pages, Vercel (framework preset: Vite), or Netlify as-is.

> Note: this is a standalone demo. The production marketing site/dashboard remains Next.js per the tech stack; the playground can be ported or embedded there later.
