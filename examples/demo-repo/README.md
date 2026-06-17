# Lockstep demo — Acme Widgets

A tiny repo showing Lockstep in action.

- [`AGENTS.md`](./AGENTS.md) is the single source of truth.
- `CLAUDE.md`, `.cursor/rules/agents.mdc`, and `.github/copilot-instructions.md` are **generated** from it (see [`lockstep.config.json`](./lockstep.config.json)).
- [`.github/workflows/lockstep.yml`](./.github/workflows/lockstep.yml) runs `lockstep check` on every push.

Try it:

```bash
# from this folder
npx lockstep check          # passes: mirrors in sync, references valid
# edit a generated mirror by hand, then:
npx lockstep check          # fails: drift detected
# put it right:
npx lockstep sync
```
