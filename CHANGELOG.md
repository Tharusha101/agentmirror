# Changelog

All notable changes to the `lockstep` CLI are documented here. This project
follows [Semantic Versioning](https://semver.org/).

## [0.1.0] — Unreleased

First public release — the open-source CLI MVP.

### Added
- `lockstep init` — scaffold a canonical `AGENTS.md` + `lockstep.config.json` (interactive; `--yes` for CI). Can import an existing context file as a starting point.
- `lockstep sync` — generate mirror files from `AGENTS.md` for Claude Code, Cursor (`.mdc` + opt-in legacy `.cursorrules`), GitHub Copilot, Gemini, Windsurf, and Cline. Real files, no symlinks; LF-normalized for cross-platform.
- `lockstep check` — CI gate that fails on mirror drift or stale file/script references.
- `lockstep lint` — leanness budget, empty/duplicate-heading, and stale-reference checks, with an `ignore` glob list for illustrative/planned paths.
- `lockstep review` — placeholder for the future opt-in AI tightening feature.
- Config-driven format registry (add a tool = one entry).
- Cross-platform CI matrix (Linux/macOS/Windows); 40 unit + integration tests.
- Migration guide: `docs/migrating-to-agents-md.md`.
