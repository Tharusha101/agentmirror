# AgentMirror

> One canonical `AGENTS.md`, synced to every AI coding tool — kept drift-free and lean.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) ![Node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen) ![status: alpha](https://img.shields.io/badge/status-alpha-orange)

> **Status:** alpha (`v0.1.0`). The CLI works and is tested on Linux/macOS/Windows; APIs may still change before `1.0`.

Every AI coding tool wants its own context file: Claude Code reads `CLAUDE.md`, Cursor reads `.cursor/rules/`, Copilot reads `.github/copilot-instructions.md`, and so on. Teams using more than one tool copy the same rules into several files — and they **drift apart within weeks**. Symlinking is the usual hack, but symlinks break on Windows and in CI and can't express per-tool format differences.

AgentMirror treats **`AGENTS.md` as the single source of truth** and:

1. **Syncs** it to every other tool's format — real files, cross-platform, no symlinks.
2. **Detects drift** — when a mirror diverges from the source, or a rule references a file/script that no longer exists.
3. **Lints for leanness** — flags bloat and stale references so the file stays short and accurate.

> Why bother: agents with no project context file complete tasks correctly ~30% of the time; with a good, lean context file, ~90%. AgentMirror keeps that file correct everywhere, automatically.

## Install

```bash
npm install -g agentmirror
```

Or run without installing:

```bash
npx agentmirror <command>
```

## Quick start

```bash
agentmirror init     # create AGENTS.md + agentmirror.config.json (you curate them)
agentmirror sync     # regenerate every mirror from AGENTS.md
agentmirror check    # CI gate: fail if mirrors drift or rules go stale
agentmirror lint     # flag bloat / stale references; suggest cuts
```

Edit `AGENTS.md`, run `agentmirror sync`, and `CLAUDE.md`, `.cursor/rules/agents.mdc`, `.github/copilot-instructions.md`, `GEMINI.md`, `.windsurfrules`, and `.clinerules` are regenerated from it. Each generated file carries a banner so no one hand-edits a mirror by mistake.

## Migrating from scattered rule files

Already have a `CLAUDE.md`, a `.cursorrules`, and a `copilot-instructions.md` drifting apart? The **[migration guide](docs/migrating-to-agents-md.md)** walks you from fragmented files to one curated `AGENTS.md` in about ten minutes — including which mirrors you actually need (many tools read `AGENTS.md` directly), how to resolve conflicting rules, and how to lock it in CI.

## Keep it honest in CI

Add a check so a drifted or stale context file fails the build:

```yaml
# .github/workflows/agentmirror.yml
name: agentmirror
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npx agentmirror check
```

## Configuration

`agentmirror.config.json` (written by `agentmirror init`):

```json
{
  "source": "AGENTS.md",
  "targets": ["claude", "cursor", "copilot", "gemini", "windsurf", "cline"],
  "ignore": ["apps/**"],
  "lint": { "maxLines": 200, "maxChars": 12000 }
}
```

`ignore` is a list of globs (`*` = one segment, `**` = any depth) for references the stale-check should skip — useful when a doc legitimately mentions illustrative or planned paths that don't exist yet.

| Target id       | Output file                          | Tool          |
| --------------- | ------------------------------------ | ------------- |
| `claude`        | `CLAUDE.md`                          | Claude Code   |
| `cursor`        | `.cursor/rules/agents.mdc`           | Cursor        |
| `cursor-legacy` | `.cursorrules` (opt-in)              | Cursor        |
| `copilot`       | `.github/copilot-instructions.md`    | GitHub Copilot|
| `gemini`        | `GEMINI.md`                          | Gemini CLI    |
| `windsurf`      | `.windsurfrules`                     | Windsurf      |
| `cline`         | `.clinerules`                        | Cline         |

Codex, Amp, Aider, Zed, Warp, and others read `AGENTS.md` directly — no mirror needed.

## A note on AI

AgentMirror does **not** auto-generate walls of context for you. Research in 2026 found LLM-generated context files *hurt* agent accuracy and raise cost, while lean, human-curated files help. Sync and drift detection are fully deterministic — no AI. AI is reserved for a future opt-in `review` that only *suggests* cuts and shows a diff you approve; it never writes rules for you.

## Repo layout

| Package          | What it is                                                      |
| ---------------- | -------------------------------------------------------------- |
| `packages/core`  | Pure engine: parse, render mirrors, detect drift, lint. No I/O.|
| `packages/cli`   | The `agentmirror` command, wrapping `core`.                        |
| `examples/demo-repo` | A clonable example showing AGENTS.md + generated mirrors.   |

## Develop

```bash
npm install      # install workspace deps
npm run build    # build core then cli
npm test         # run all unit + integration tests
npm run typecheck
```

## License

MIT
