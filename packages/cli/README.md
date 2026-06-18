# lockstep

> One canonical `AGENTS.md`, synced to every AI coding tool — kept drift-free and lean.

Every AI coding tool wants its own context file (Claude Code → `CLAUDE.md`, Cursor → `.cursor/rules/`, Copilot → `.github/copilot-instructions.md`, …). Keep **one** `AGENTS.md` and let `lockstep` generate and police the rest — real files, cross-platform, no symlinks.

## Install

```bash
npm install -g lockstep
# or, no install:
npx lockstep <command>
```

## Commands

```bash
lockstep init     # create AGENTS.md + lockstep.config.json (you curate them)
lockstep sync     # regenerate every mirror from AGENTS.md
lockstep check    # CI gate: fail if mirrors drift or rules reference missing files
lockstep lint     # flag bloat / stale references; suggest cuts
```

Global `--cwd <dir>` runs against another directory (handy in CI/monorepos).

## What it does

1. **Sync** `AGENTS.md` → `CLAUDE.md`, `.cursor/rules/agents.mdc`, `.github/copilot-instructions.md`, `GEMINI.md`, `.windsurfrules`, `.clinerules`. Each mirror carries a "generated — edit AGENTS.md" banner.
2. **Detect drift** — a mirror diverged from source, or a rule references a file/script that no longer exists.
3. **Lint for leanness** — flag bloat and stale references.

## Config — `lockstep.config.json`

```json
{
  "source": "AGENTS.md",
  "targets": ["claude", "cursor", "copilot", "gemini", "windsurf", "cline"],
  "ignore": ["apps/**"],
  "lint": { "maxLines": 200, "maxChars": 12000 }
}
```

Full docs, the format table, and a clonable demo: **https://github.com/OWNER/lockstep**

## License

MIT
