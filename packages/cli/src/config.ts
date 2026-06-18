import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_TARGETS } from '@agentmirror/core';

export const CONFIG_FILE = 'agentmirror.config.json';

export interface AgentMirrorConfig {
  /** Canonical source file. */
  source: string;
  /** Format ids to keep in sync (see `FORMATS` in @agentmirror/core). */
  targets: string[];
  /** Glob patterns for references to skip in stale-reference checks. */
  ignore: string[];
  /** Leanness budgets for `agentmirror lint`. */
  lint: { maxLines?: number; maxChars?: number };
}

export function defaultConfig(): AgentMirrorConfig {
  return { source: 'AGENTS.md', targets: [...DEFAULT_TARGETS], ignore: [], lint: {} };
}

/** Load agentmirror.config.json from `cwd`, falling back to sensible defaults. */
export function loadConfig(cwd: string): AgentMirrorConfig {
  const base = defaultConfig();
  const path = join(cwd, CONFIG_FILE);
  if (!existsSync(path)) return base;
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<AgentMirrorConfig>;
    return {
      source: raw.source ?? base.source,
      targets: raw.targets ?? base.targets,
      ignore: raw.ignore ?? base.ignore,
      lint: { ...base.lint, ...(raw.lint ?? {}) },
    };
  } catch (err) {
    throw new Error(`Invalid ${CONFIG_FILE}: ${(err as Error).message}`);
  }
}
