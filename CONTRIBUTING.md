# Contributing to AgentMirror

Thanks for helping out. AgentMirror is a small TypeScript monorepo; the bar is: **`core` stays pure and tested, files stay lean.**

## Setup

```bash
npm install        # install workspace deps
npm run build      # build @agentmirror/core then the CLI
npm test           # vitest: unit (core) + integration (cli)
npm run typecheck
```

## Where things live

- `packages/core` — pure engine (parse, render mirrors, drift, lint). **No filesystem access here.** Add a new tool format by registering a `FormatDef` in `src/formats.ts`.
- `packages/cli` — the `agentmirror` command; all I/O lives here.
- `examples/demo-repo` — a runnable example; keep it in sync (`agentmirror check` passes there).

## Ground rules

- Any change to `core` ships with a unit test.
- Don't restate the code in docs or generated files — we dogfood our own lint (`agentmirror check` runs in CI on this repo).
- This repo is itself managed by AgentMirror: **edit `AGENTS.md`, not `CLAUDE.md`** (the latter is generated).
- No symlinks for sync; generate real files. Keep formats config-driven, not hardcoded.

## Pull requests

Keep them focused. Make sure `npm run typecheck`, `npm run build`, `npm test`, and `node packages/cli/dist/index.js check` all pass before opening.
