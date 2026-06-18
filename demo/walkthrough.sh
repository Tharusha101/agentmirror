#!/usr/bin/env bash
# AgentMirror walkthrough: from drifting rule files to one synced AGENTS.md.
# Runs in a throwaway temp dir. Uses a global `agentmirror` if installed,
# otherwise the local build in this repo.
#
#   ./demo/walkthrough.sh
#
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AM="${AGENTMIRROR:-node $ROOT/packages/cli/dist/index.js}"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"

echo "### 1. The mess — two tools, two files, already contradicting each other"
mkdir -p src && echo 'export const x = 1;' > src/index.ts
cat > package.json <<'JSON'
{ "name": "demo", "scripts": { "build": "tsc" } }
JSON
cat > CLAUDE.md <<'MD'
# Project rules
- Indent with TABS.
MD
cat > .cursorrules <<'MD'
# Project rules
- Indent with SPACES.
MD
echo "CLAUDE.md says tabs; .cursorrules says spaces. Which does the agent believe?"

echo
echo "### 2. Consolidate into ONE canonical AGENTS.md"
cat > AGENTS.md <<'MD'
# Project rules

> Canonical context. Edit here, then run `agentmirror sync`.

## Conventions
- Indent with spaces (2) — the single answer for every tool.
- Build with `npm run build`; the entry point is `src/index.ts`.
MD
cat > agentmirror.config.json <<'JSON'
{ "source": "AGENTS.md", "targets": ["claude", "cursor"] }
JSON
echo "(in real life, \`agentmirror init\` imports an existing file for you)"

echo
echo "### 3. Generate every tool's mirror from it"
$AM sync
echo "--- generated CLAUDE.md (top) ---"
head -n 3 CLAUDE.md

echo
echo "### 4. Drift can't sneak back — someone hand-edits a mirror:"
echo "- Actually, use tabs." >> CLAUDE.md
$AM check
echo "exit code: $?  (non-zero = CI fails)"

echo
echo "### 5. Re-sync fixes it"
$AM sync >/dev/null && $AM check
echo "exit code: $?"

echo
echo "### 6. Stale rules get caught too — reference a file that doesn't exist:"
printf '%s\n' '- See `src/deleted.ts` for details.' >> AGENTS.md
$AM sync >/dev/null
$AM check
echo "exit code: $?"

echo
echo "Done. One file to edit, every tool in sync, drift + stale rules caught in CI."
