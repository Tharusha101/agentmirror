# AgentMirror — build authority

> This is the **canonical** agent context for building **AgentMirror** (`AGENTS.md`); every other tool's file (`CLAUDE.md`, …) is generated from it by `agentmirror sync` — edit this file, not the mirrors. Strategic context lives in `BUSINESS_PLAN.md`. Keep this file lean — every line must earn its place. If a rule no longer reflects reality, fix it here first, then change the code.

## Golden rules

1. **Validate before building.** Do not start Phase 1 until Step 0 (BUSINESS_PLAN §9) is done.
2. **Curation over generation.** AgentMirror never auto-writes or auto-commits context rules. Auto-generated context files measurably *hurt* agent accuracy and cost more tokens. AI may only **suggest** and **tighten**; a human approves.
3. **AGENTS.md is canonical.** It is the one source of truth; every other format is a generated, in-sync mirror.
4. **Lean files.** Enforce leanness in our own repo and in the product's output. The test for any rule: *would removing this cause the agent to make a mistake it can't recover from?* If no, cut it.
5. **Cross-platform, no symlinks.** Generate real files. Symlinks break on Windows and in some CI.
6. **Cost discipline is a feature.** Haiku-class models for any AI calls, prompt caching for static prompts, Batch API for non-real-time work. Cap and log AI spend.
7. **Ship public-facing things behind a human approval step.** This includes anything the ops/agent layer posts.

## What we are building (1 paragraph)

A tool that keeps `AGENTS.md` as the canonical context file and (1) **syncs** it to every other tool's format, (2) **detects drift** — mirrors out of sync, or rules that reference files/scripts/commands no longer in the repo — via a GitHub App / CI check, and (3) **lints for leanness** — flags bloat that restates the code. Open-core: free OSS CLI + free GitHub App on public repos; paid GitHub App for private repos and teams.

## Verified facts (source of truth — do not contradict)

**Format → tool mapping** (drives the sync engine; make it config-driven so new formats are plugins):

| Canonical | Mirror file | Tool |
|---|---|---|
| `AGENTS.md` | `CLAUDE.md` | Claude Code |
| `AGENTS.md` | `.cursor/rules/` (new) · `.cursorrules` (legacy) | Cursor |
| `AGENTS.md` | `.github/copilot-instructions.md` | GitHub Copilot |
| `AGENTS.md` | (native) | Codex CLI |
| `AGENTS.md` | `GEMINI.md` | Gemini CLI / Jules |
| `AGENTS.md` | `.windsurfrules` | Windsurf |
| `AGENTS.md` | `.clinerules` | Cline |

- `AGENTS.md`: pioneered by OpenAI for Codex; donated to the Linux Foundation's Agentic AI Foundation (Dec 2025). Cross-tool standard.
- Many tools read `AGENTS.md` directly (Codex, Copilot, Cursor, Gemini, Amp, Devin, Aider, Windsurf, Zed, Warp, Factory). **Claude Code primarily uses `CLAUDE.md`** — treat AGENTS.md→CLAUDE.md sync as essential, not optional.
- Precedence is **nearest-file-wins** in the directory tree (subdir files override parent). The sync engine and drift check must respect per-directory files, not just the root.
- Research (2026, ETH-referenced, reported by Augment Code): LLM-generated context files reduced task success ~0.5–2% and raised inference cost >20%; human-curated files improved success ~4 points. → product principle #2 above.
- Context files raise agent task success from ~30% (no file) to ~90% (good file). This is the "why" for the whole product.

## Tech stack (locked)

- **CLI:** TypeScript + Node (single binary via `tsup`/`pkg`). Distributed via npm. Must run on macOS, Linux, **Windows**, and in CI.
- **GitHub App:** webhooks on PRs/pushes → checks API (status + PR comments). Node/TypeScript service (FastAPI is fine for any heavier processing if preferred, but keep one language unless there's a reason).
- **Web (dashboard + marketing/docs):** Next.js + Tailwind on Vercel. Dark theme, neon accents.
- **DB / auth:** Supabase (Postgres + RLS + Auth).
- **AI:** Anthropic API — Haiku-class for the opt-in review/lint-suggestion feature; prompt caching for the static system prompt; Batch API for nightly/bulk suggestions.
- **Billing:** Paddle (Merchant of Record). **Payout:** Payoneer → bank. (See BUSINESS_PLAN §5.)

## Architecture

- **`packages/core`** — pure logic, no I/O: parse `AGENTS.md`, render each mirror format, diff for drift, lint (bloat + stale-reference). Fully unit-tested. This is the engine both the CLI and the App import.
- **`packages/cli`** — `agentmirror` commands wrapping core; reads/writes files; runs in CI.
- **`apps/github-app`** — webhook listener → uses `core` → posts checks/comments. Stores install + plan state in Supabase.
- **`apps/web`** — Next.js: marketing, docs, dashboard (repos, plan, billing via Paddle), team rule library.
- **Stale-reference detection:** parse rules for file paths / script names / commands, check them against the repo tree and `package.json`/manifest scripts; flag misses.
- **Drift detection:** re-render mirrors from canonical `AGENTS.md`; if committed mirror ≠ rendered, that's drift.

Supabase tables (sketch): `accounts`, `installations` (GitHub app installs), `repos`, `subscriptions` (Paddle), `rule_library_entries`, `usage` (AI calls/cost). RLS on everything; an account only sees its own rows.

## AI usage rules (inside the product)

- AI is **opt-in** and used only to: suggest bloat removals, detect likely-stale rules, and optionally draft a **starter** `AGENTS.md` from the repo that the human edits (never auto-committed).
- Model: Haiku-class. System prompt: static → **prompt-cached**. Bulk/nightly suggestions → **Batch API**.
- Always show suggestions as a diff for human approval. Never write rules silently.
- Log token usage and cost per account; enforce a per-plan cap.

## Build order (phased — respect pause points)

**Phase 0 — Validation.** Per BUSINESS_PLAN §9. *Pause: open Payoneer; read Paddle seller requirements.*

**Phase 1 — OSS CLI MVP**
1. `packages/core`: parse + render mirrors for CLAUDE.md, Cursor, Copilot. Unit tests.
2. `core`: `lint` (bloat + stale-reference) and `diff` (drift).
3. `packages/cli`: `init`, `sync`, `check`, `lint`. Cross-platform.
4. README + a clonable demo repo. → **DoD: an external dev runs it and keeps it.**

**Phase 2 — GitHub App (free on public repos)**
5. Webhook → `core` → checks API: status + PR comment on drift/stale rules.
6. Install flow; Next.js docs/marketing site (dark/neon). → **DoD: first public repos install it.**

**Phase 3 — Paid layer**
7. Private-repo support, multi-repo dashboard, team rule library.
8. Paddle billing (apply now there's a real product) + Payoneer payout; Supabase plan gating + RLS.
9. Opt-in AI review (Haiku, cached, batch). → **DoD: first paying customer.**

**Phase 4 — Scale.** SEO content engine + listening agent (human-approved). Tune pricing from real signups. → **DoD: $100/mo sustained 3 months.**

## Definitions of done (apply to every PR)

- Core logic has unit tests; CLI verified on macOS/Linux/Windows.
- No rule, doc, or generated file restates what the code already says (leanness check passes — dogfood our own lint).
- No secret in the repo; Supabase RLS covers any new table.
- Any AI call uses Haiku-class + caching, is opt-in, and shows a human-approvable diff.
- Anything user/public-facing has a human approval step before it ships.

## Do / Don't

**Do:** keep `core` pure and tested · make formats config/plugin-driven · respect nearest-file precedence · dogfood AgentMirror on this repo · keep this file short.

**Don't:** auto-generate or auto-commit context rules · use symlinks for sync · ship a feature that bloats context files · let any agent post publicly without review · hardcode the format list · contradict the Verified Facts without updating them here first.

## Commands (CLI surface — keep stable)

```
agentmirror init     # create canonical AGENTS.md (interactive; human curates)
agentmirror sync     # regenerate all mirror files from AGENTS.md
agentmirror check    # CI: fail if mirrors drift or rules reference missing files
agentmirror lint     # flag bloat / stale references; suggest cuts
agentmirror review   # (paid, opt-in) AI suggests tightening — shows a diff to approve
```
