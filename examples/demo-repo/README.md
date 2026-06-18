# AgentMirror demo — Acme Widgets

A tiny repo showing AgentMirror in action.

- [`AGENTS.md`](./AGENTS.md) is the single source of truth.
- `CLAUDE.md`, `.cursor/rules/agents.mdc`, and `.github/copilot-instructions.md` are **generated** from it (see [`agentmirror.config.json`](./agentmirror.config.json)).
- [`.github/workflows/agentmirror.yml`](./.github/workflows/agentmirror.yml) runs `agentmirror check` on every push.

Try it:

```bash
# from this folder
npx agentmirror check          # passes: mirrors in sync, references valid
# edit a generated mirror by hand, then:
npx agentmirror check          # fails: drift detected
# put it right:
npx agentmirror sync
```
