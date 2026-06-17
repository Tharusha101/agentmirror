# @lockstep/core

The pure engine behind [Lockstep](../../README.md). No filesystem access — it takes strings and a repo index, and returns rendered files, drift results, and lint findings. Both the CLI and the GitHub App import it.

```ts
import { parse, renderTargets, detectDrift, lint } from '@lockstep/core';

const doc = parse(agentsMdText);
const mirrors = renderTargets(doc, ['claude', 'cursor', 'copilot']);
```

Add a tool by registering a `FormatDef` in `src/formats.ts` — there are no per-tool branches anywhere else.
