# Lockstep — Business Plan & Authority Doc

> **Codename:** Lockstep *(provisional — rename before public launch. See "Naming" at the end.)*
> **One-line pitch:** One source of truth for your AI coding-agent context, synced to every tool and kept lean and drift-free.
> **Owner:** Tharusha · **Location:** Sri Lanka · **Type:** Bootstrapped solo micro-SaaS, run as a side hustle, operated with AI agents.
> **Primary goal:** Reach a sustained **USD $100+/month** in net recurring revenue, then scale.
> **Status:** Pre-build. This doc is the strategic source of truth. `CLAUDE.md` is the build source of truth.

---

## 0. The honest frame (read this first)

- **$100/month is the easy end.** Roughly 70% of micro-SaaS products make under $1,000/month. A handful of paying repos clears your target.
- **It still takes months, not days.** Expect to build for a few weeks, then spend longer on distribution before $100/mo is *reliable*. The hard part is distribution, not code — and you can already code.
- **"Run by agents" = AI does the repetitive operations, you stay in the loop for judgment.** Fully-autonomous businesses are mostly marketing. The setups that work keep agents in narrow lanes (support, content, lead discovery) and have a human approve anything that ships.
- **Do not skip Step 0 (validation).** See §9.

---

## 1. The opportunity

Context engineering — giving AI coding agents persistent, structured project context — is the defining developer skill of 2026 (Karpathy popularised the framing). The payoff is large and measurable: agents with no project context file complete tasks correctly only ~30% of the time; with well-crafted context files, ~90%.

The result is a real, growing pain in every AI-assisted codebase: **format fragmentation and drift.** Each tool wants its own file:

| Tool / Agent | Context file it reads |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/` (new), `.cursorrules` (legacy), also `AGENTS.md` |
| GitHub Copilot | `.github/copilot-instructions.md`, also `AGENTS.md` |
| OpenAI Codex CLI | `AGENTS.md` |
| Gemini CLI / Jules | `GEMINI.md`, also `AGENTS.md` |
| Windsurf | `.windsurfrules`, also `AGENTS.md` |
| Cline | `.clinerules` |
| Amp (Sourcegraph) | `AGENTS.md` (falls back to `CLAUDE.md`) |
| Devin, Aider, Zed, Warp, Roo Code, Factory | `AGENTS.md` |

Most teams use more than one tool, so the same rules get copied into several files that **drift apart within weeks**. The emerging fix is a single standard: `AGENTS.md`, pioneered by OpenAI for Codex and donated to the Linux Foundation's Agentic AI Foundation in December 2025. The standard exists; the tooling to actually *live by it* across every format does not, yet.

**The DIY workaround today** is symlinking (`ln -s AGENTS.md CLAUDE.md`). It's fragile: symlinks break on Windows and in some CI runners, they can't express tool-specific format differences, and they do nothing about bloat or stale rules. That gap is the product.

---

## 2. The product

**What Lockstep is:** a tool that treats `AGENTS.md` as the canonical source of truth and keeps every other tool's context file in sync with it — automatically, in a way that survives Windows and CI — while keeping the files **lean and accurate**.

Three jobs, in priority order:

1. **Sync.** One canonical `AGENTS.md` → generated, in-sync mirrors for `CLAUDE.md`, `.cursorrules`/`.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md`, `.windsurfrules`, etc. Cross-platform (real files, not symlinks).
2. **Drift detection (the recurring value).** A GitHub App / CI check that **fails the build or comments on the PR** when (a) the mirrors diverge from the source, or (b) a rule references a file, script, or command that no longer exists in the repo (stale rules).
3. **Lint for leanness.** Flags bloat — lines that merely restate what the code already says — and enforces a budget (keep the file short; every line must earn its place: *"would removing this cause the agent to make a mistake it can't recover from?"*).

**What Lockstep is NOT — and why this matters:** it is **not** a tool that uses AI to auto-write walls of context for you. Independent analysis in 2026 found that LLM-generated context files actually *hurt* agent accuracy (more tokens, more noise, ~20%+ higher inference cost), while lean, human-curated files help. Auto-generating and committing performs **worse than no file at all**. Lockstep therefore:

- Treats the human's curated `AGENTS.md` as authoritative.
- Uses AI only to **suggest and tighten** (propose removals of bloat, flag stale references, optionally draft a *starter* file the human then edits) — never to silently generate or auto-commit rules.

This is the moat: sync + drift + lint + governance is operational software grounded in what actually improves agent outcomes. It is much harder to commoditise than one-shot generation, and the "keep it in sync forever" job is inherently a subscription.

---

## 3. Why this is the right bet for you

- **You have genuine authority.** You already run a cross-project `CLAUDE.md` authority pattern — this is that exact discipline, productised. You can build it credibly, dogfood it on PenduLab / FitTwin / the store, and write about it with real experience.
- **It's squarely your stack.** Next.js, Supabase, FastAPI, the Anthropic API. No new domain to learn.
- **GitHub-first distribution suits a developer.** Free OSS + a GitHub App is the natural funnel, and your audience (developers using AI coding agents) is reachable where you already are.
- **It's genuinely agent-runnable.** Low support burden; ops (support, SEO, listening) automate well.
- **It honours your cost discipline.** AI is used sparingly and correctly inside the product (Haiku-class, prompt caching, batch), which is also a selling point.
- **Timing.** The `AGENTS.md` standard is young and the migration/drift pain is peaking now.

---

## 4. Business model & pricing

**Open-core.**

- **Free (open source, MIT):** `lockstep` CLI — sync + local lint, run manually or in your own CI. Free GitHub App on **public** repos, single repo. This is the distribution engine, not a loss leader to resent.
- **Paid (subscription, the GitHub App running continuously):**
  - PR-level **drift detection** (checks + comments) on **private** repos.
  - **Lint/bloat** enforcement in CI with team-configurable rules.
  - **Multi-repo / org dashboard.**
  - **AI-assisted review** (suggest removals, detect stale rules) — opt-in, Haiku-class, prompt-cached.
  - **Shared team rule library / templates.**

**Indicative pricing (validate against real signups):**

- **Free:** public repos, 1 developer.
- **Pro:** ~$7/repo/month *or* a flat ~$15/month for up to N private repos (solo devs, small teams).
- **Team:** ~$15–19/user/month (org dashboard, shared library, SSO later).

**Unit math to the goal:** at ~$7/repo, **~15 paid private repos = ~$105/mo**. At a $15 solo plan, **~7 customers**. At team pricing, **one or two small teams**. All well within reach for a focused dev tool.

**Margins:** developer tools run 80–90% gross margin with low churn once they're part of a workflow. Your only meaningful variable cost is the (small, capped) AI spend on the opt-in review feature.

---

## 5. Getting paid from Sri Lanka

This is the part that blocks most Sri Lankan founders, so it's decided up front.

- **Don't rely on Stripe** — it operates in ~46 countries and Sri Lanka isn't one.
- **Don't rely on PayPal to *receive*** — it can send from Sri Lanka but is unreliable for receiving, which breaks PayPal-based payout setups (this is why Lemon Squeezy is a poor fit for now).
- **Use a Merchant of Record (MoR).** You sell; the MoR becomes the legal seller, collects and remits global sales tax/VAT, and pays you out.

**Primary: Paddle (MoR).** Paddle pays out to sellers in any non-sanctioned country (Sri Lanka qualifies), routed to a **bank account or Payoneer**.
- ⚠️ Paddle **reviews and approves sellers**, so apply once you have a working product and a clear, legitimate website. Don't apply with an empty landing page.

**Receiving rail: Payoneer** — works in Sri Lanka; connect it to Paddle for payouts, then withdraw to your local bank.

**Fallbacks if Paddle declines:** Dodo Payments (South-Asia-friendly MoR — confirm Sri Lanka payout at signup) or Gumroad (simpler, MoR, lower ceiling). Keep one fallback ready.

**Local Sri Lankan customers:** not the target for this product (sell globally in USD). PayHere stays on the bench unless you later add a LK-specific offering.

---

## 6. The agent-run operations layer

You build and supervise; agents handle the repetitive volume. Keep each agent narrowly scoped and keep a human approval step before anything ships publicly.

- **Support / FAQ agent (Claude-powered).** Drafts replies to common questions (setup, sync config, billing) from a maintained knowledge base. You approve non-trivial replies. Low volume for a tool like this.
- **SEO content pipeline.** Drafts and schedules posts on the exact problem you solve ("fix CLAUDE.md / AGENTS.md drift", "stop copying rules between Cursor and Claude Code", "AGENTS.md migration"). Content compounds; ads don't. You edit before publish.
- **Listening agent.** Scans Reddit (r/ClaudeAI, r/cursor, r/ChatGPTCoding), Hacker News, and X for people describing context-drift / multi-tool-rules pain, so you can reply with genuine value (not promotion). Intent-based outreach converts far better than cold outreach.

**Cost discipline (also a product value):** Haiku-class models for high-frequency tasks, prompt caching for static system prompts, Batch API for non-real-time jobs (e.g. nightly content drafts, bulk lint suggestions). Never let the ops layer post publicly without review.

---

## 7. Distribution / go-to-market

90% of indie products fail at distribution, not product. Plan it like a feature.

1. **Open source first.** Ship the CLI as a clean, well-documented MIT repo. The README *is* marketing. A polished public repo builds trust before you charge.
2. **Build in public.** Short, consistent updates on X and dev.to: the drift problem, the leanness research, your own dogfooding numbers. Pick one channel and run it for 90 days before judging it.
3. **Ride the AGENTS.md wave.** Publish the canonical "how to migrate your fragmented rules to one `AGENTS.md`" guide and a comparison piece. Aim to be the practical reference.
4. **Community, value-first.** Be present in the AI-coding subreddits and Discords. Help people; let your profile do the selling. Promotion never, value always.
5. **Listening → reply.** Use the listening agent to find intent and respond with help.
6. **Free → paid funnel.** Free CLI / public-repo App earns trust and stars → private repos and teams convert to paid when drift starts costing them real time.

---

## 8. Roadmap

Phased, with explicit pause points for actions only you can do. Build the foundation before the paid layer.

**Phase 0 — Validation (days, before any heavy code).** See §9. Confirm the pain, scan competitors, secure the money rail. *Pause point: open Payoneer; pre-read Paddle requirements.*

**Phase 1 — OSS CLI MVP (~1–2 weeks of side-hustle time).**
- `AGENTS.md` → mirror generation for the top 3 formats (CLAUDE.md, Cursor, Copilot).
- Local `lint` (bloat + stale-reference checks) and `check` (drift) commands.
- Great README + a demo repo people can clone and try.
- **Milestone:** first external user runs it and keeps it.

**Phase 2 — GitHub App + PR checks (free on public repos).**
- App posts a status check / PR comment on drift and stale rules.
- Onboarding flow, docs site (dark/neon, your aesthetic).
- **Milestone:** first repos install the App.

**Phase 3 — Paid layer (private repos & teams).**
- Billing via Paddle (apply now that there's a real product); Payoneer payout connected.
- Private-repo support, multi-repo dashboard, team rule library.
- Opt-in AI review (Haiku, cached, batch).
- **Milestone: first paying customer.**

**Phase 4 — Scale to and past $100/mo.**
- SEO content engine + listening agent running steadily.
- Pricing/packaging tuning from real signups.
- **Milestone: $100/mo sustained → then optimise toward $500+/mo.**

**Realistic timeline:** Phases 1–2 in a few weekends. First paying customer within 1–3 months of launching publicly if distribution is consistent. Sustained $100/mo is a distribution outcome, not a build outcome.

---

## 9. Risks & validation

**Step 0 — Validation (do this before building):**
- **Confirm the pain is paid-for, not just real.** Find ≥10 developers/teams using 2+ AI coding tools who complain about drift/duplication. Ask if they'd pay to fix it.
- **Competitive scan.** Search for any existing "AGENTS.md source-of-truth / sync / drift / lint" tool (not just generators). If a dominant one exists, differentiate on the lint/drift/governance layer or pick the next idea. Don't assume the field is empty.
- **Secure the rail.** Open a Payoneer account; read Paddle's seller requirements so you're ready to apply at Phase 3.

**Ongoing risks & mitigations:**
- *Incumbents build native sync (GitHub, Anthropic, Cursor).* → Stay tool-neutral: no single vendor will lovingly sync to its competitors' formats. Own the lint/drift/team-governance layer. Move fast while the standard is young.
- *The standard shifts.* → Build the format mapping as config/plugins so new formats are easy to add; that adaptability is itself a feature.
- *The "auto-generate" temptation.* → Don't. Auto-generated bloat hurts outcomes. Curation + sync + leanness is the whole thesis.
- *Low support volume cuts both ways.* → It's good for a side hustle, but means you must go to where users are; they won't file tickets that bring you traffic.

---

## 10. Definition of "this is working"

- A stranger installs the OSS CLI/App and keeps using it (retention, not just a star).
- The drift check catches a real divergence in someone's repo and they thank you for it.
- First paying customer for the private-repo/team layer.
- $100/month net, sustained for 3 consecutive months, with ops running mostly on the agent layer and < a few hours/week of your time.

---

## Naming

`Lockstep` is a placeholder (it evokes "everything in sync"). Pick the real name yourself — short, typeable as a CLI command, low search-collision, ideally `.dev`-able. Some directions to react to: a sync/source-of-truth metaphor (e.g. *throughline*, *keystone*, *concord*), or a context/canon metaphor. Whatever you choose, lock it before the public OSS repo goes live so the package name and domain don't have to change later.
