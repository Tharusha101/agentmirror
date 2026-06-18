# Migrating fragmented AI rules to one `AGENTS.md`

If your repo has collected a `CLAUDE.md`, a `.cursorrules`, a `.github/copilot-instructions.md`, maybe a `GEMINI.md` — each holding an overlapping, slowly-diverging copy of the same rules — this guide moves you to a single source of truth in about ten minutes. You keep **one** curated `AGENTS.md`; Lockstep generates and polices the rest.

## Why one file

- **Duplication becomes drift.** You edit one file, forget the others, and your agents start getting conflicting instructions.
- **Symlinks aren't the answer.** `ln -s AGENTS.md CLAUDE.md` is the common hack, but symlinks break on Windows and some CI runners, and they can't express per-tool format differences.
- **`AGENTS.md` is the standard.** Pioneered by OpenAI for Codex and donated to the Linux Foundation's Agentic AI Foundation (Dec 2025). Most modern agents already read it.

## First: which mirrors do you actually need?

The key insight that keeps this lean: **many tools read `AGENTS.md` directly**, so you often only need a mirror or two.

| Tool | Reads `AGENTS.md` directly? | Generate a mirror? |
| --- | --- | --- |
| Codex, Amp, Aider, Zed, Warp, Devin, Factory | Yes | No — native |
| Cursor | Yes (also `.cursor/rules/`) | Optional (recommended) |
| GitHub Copilot | Yes (also `.github/copilot-instructions.md`) | Optional |
| Gemini CLI | Yes (also `GEMINI.md`) | Optional |
| Windsurf | Yes (also `.windsurfrules`) | Optional |
| **Claude Code** | Primarily uses `CLAUDE.md` | **Yes — essential** |
| **Cline** | No — uses `.clinerules` | **Yes** |

**Rule of thumb:** generate `CLAUDE.md` (Claude Code) and `.clinerules` (Cline) if you use those tools; the rest are optional, because those tools also read `AGENTS.md`.

## Step by step

### 1. Start from your richest existing file

Whichever file has your best rules today — often `CLAUDE.md` or `.cursorrules` — is your starting point. Don't start from a blank page.

### 2. Initialize

```bash
npx lockstep init
```

When it finds existing context files, choose to **import one** as the starting `AGENTS.md`. Then pick which tools to keep in sync — this writes `lockstep.config.json`.

### 3. Consolidate and curate — the part that matters

Open `AGENTS.md`, merge in anything useful from your other files, then **cut**. The test for every line:

> *Would removing this cause the agent to make a mistake it can't recover from?*

If not, delete it. Lean, human-curated files measurably beat bloated ones — auto-generated walls of context actually *lower* agent accuracy and cost more tokens.

- **Resolve conflicts.** Where `CLAUDE.md` and `.cursorrules` disagreed, keep the correct (usually stricter) rule. `AGENTS.md` is now the single answer.
- **Delete restatements of the code.** Anything an agent can read from the source itself is noise.

### 4. Generate the mirrors

```bash
lockstep sync
```

Real files appear (`CLAUDE.md`, `.cursor/rules/agents.mdc`, …), each with a banner marking it generated. **Never hand-edit a mirror** — edit `AGENTS.md` and re-sync.

### 5. Remove the now-redundant files

For tools that read `AGENTS.md` natively, delete the old standalone file and leave it out of `targets`. One less thing to maintain.

### 6. Lock it in CI so it can't drift again

```yaml
# .github/workflows/lockstep.yml
- run: npx lockstep check
```

This fails the build if any mirror diverges from `AGENTS.md`, or if a rule references a file or script that no longer exists.

## Monorepos

The `AGENTS.md` standard is **nearest-file-wins**: a subdirectory's file overrides the root for that subtree. Today Lockstep manages one configured source per run — point it at a package with `lockstep --cwd packages/foo sync` if you keep several. First-class multi-file handling is on the roadmap.

## Common gotchas

- **"`check` fails on a path I mention on purpose."** Docs reference illustrative or planned paths. Add them to `ignore` in `lockstep.config.json` (globs: e.g. `apps/**`).
- **"A mirror keeps showing as drift."** Someone hand-edited it. Edit `AGENTS.md`, run `lockstep sync`.
- **Don't reach for symlinks.** Generate real files — they survive Windows and CI.

## That's it

One file to edit, every tool in sync, and drift caught in CI before it confuses an agent.
