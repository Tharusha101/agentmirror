import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_TARGETS } from '@lockstep/core';

export const CONFIG_FILE = 'lockstep.config.json';

export interface LockstepConfig {
  /** Canonical source file. */
  source: string;
  /** Format ids to keep in sync (see `FORMATS` in @lockstep/core). */
  targets: string[];
  /** Glob patterns for references to skip in stale-reference checks. */
  ignore: string[];
  /** Leanness budgets for `lockstep lint`. */
  lint: { maxLines?: number; maxChars?: number };
}

export function defaultConfig(): LockstepConfig {
  return { source: 'AGENTS.md', targets: [...DEFAULT_TARGETS], ignore: [], lint: {} };
}

/** Load lockstep.config.json from `cwd`, falling back to sensible defaults. */
export function loadConfig(cwd: string): LockstepConfig {
  const base = defaultConfig();
  const path = join(cwd, CONFIG_FILE);
  if (!existsSync(path)) return base;
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<LockstepConfig>;
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
