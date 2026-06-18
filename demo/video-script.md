# AgentMirror — demo video script & storyboard

A ready-to-record plan for a ~75-second product demo. Shows the **problem**, the **fix**, and **why it matters** — then a call to action. Everything it films already exists in this repo.

## Setup before recording

- **Terminal** — large font (18–22pt), dark theme, clear/empty prompt. Use the throwaway flow or `demo/walkthrough.sh`.
- **Playground** — `npm run dev -w @agentmirror/playground` → http://localhost:5173
- **Landing page** — `npm run dev -w @agentmirror/web` → http://localhost:3000
- Record at 1080p. Capture terminal and browser separately, then cut together.
- Tools: Loom, Screen Studio, or OBS. (For a silent GIF of the terminal parts, record `demo/walkthrough.sh` with asciinema.)

## Storyboard

| # | Time | On screen | Caption (on-screen text) | Voiceover |
|---|------|-----------|--------------------------|-----------|
| 1 | 0:00–0:08 | File tree highlighting `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `GEMINI.md` | **Same rules. Five files.** | "If you use more than one AI coding tool, you're keeping the same project rules in a different file for each one." |
| 2 | 0:08–0:16 | Two files side by side: `CLAUDE.md` says *tabs*, `.cursorrules` says *spaces* | **They drift apart.** | "You edit one, forget the others, and within weeks they contradict each other — so your agents get confused." |
| 3 | 0:16–0:26 | Terminal: `agentmirror init` then open `AGENTS.md` | **One source of truth.** | "AgentMirror fixes that. You keep a single, curated AGENTS.md…" |
| 4 | 0:26–0:36 | Terminal: `agentmirror sync` listing generated mirrors | **Sync → every tool.** | "…and it generates every tool's file from it. Real files, cross-platform, no symlinks." |
| 5 | 0:36–0:50 | Terminal: hand-edit `CLAUDE.md`, run `agentmirror check` → red ✗, exit 1 | **Drift can't sneak back.** | "Add `agentmirror check` to CI and the build fails the moment a mirror drifts — or a rule points at a file that no longer exists." |
| 6 | 0:50–1:00 | Browser: playground, typing in AGENTS.md, mirrors update live on the right | **Try it in your browser.** | "Here's the engine running live — edit on the left, every format updates on the right. Nothing leaves your machine." |
| 7 | 1:00–1:09 | Landing page hero + the **~30% → ~90%** stat | **Lean files. Better agents.** | "Good, lean context files take agent task success from about thirty percent to ninety. AgentMirror keeps yours correct everywhere — automatically." |
| 8 | 1:09–1:15 | Terminal: `npm install -g agentmirror` + the GitHub URL | **npm install -g agentmirror** | "Open source, MIT. Install it today." |

## Full narration (for voiceover or captions)

> If you use more than one AI coding tool, you're keeping the same project rules in a different file for each one. You edit one, forget the others, and within weeks they contradict each other — so your agents get confused. AgentMirror fixes that. You keep a single, curated AGENTS.md, and it generates every tool's file from it — real files, cross-platform, no symlinks. Add `agentmirror check` to CI and the build fails the moment a mirror drifts, or a rule points at a file that no longer exists. Here's the engine running live in the browser — edit on the left, every format updates on the right. Good, lean context files take agent task success from about thirty percent to ninety, and AgentMirror keeps yours correct everywhere, automatically. Open source, MIT — install it today.

## Cutdowns

- **30-second social cut:** scenes 1, 2, 4, 5, 8.
- **Silent GIF (README/X):** scenes 3–5, recorded from `demo/walkthrough.sh` via asciinema → convert with `agg` or `svg-term`.

## Recording tips

- Pause ~1s after each command so cuts land cleanly.
- Pre-type long commands; hit Enter on camera.
- Keep the total under 90s — attention drops fast on social.
- End on the install command and the repo URL, held for 2–3s.
