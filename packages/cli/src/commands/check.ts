import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, renderTargets, detectDrift, checkReferences } from '@lockstep/core';
import type { DriftResult, StaleFinding } from '@lockstep/core';
import { loadConfig } from '../config';
import { buildRepoIndex } from '../fs-utils';
import { sym, title, dim } from '../report';
import type { CommandOptions } from './sync';

export interface CheckResult {
  ok: boolean;
  drift: DriftResult[];
  stale: StaleFinding[];
}

/**
 * CI gate: non-zero exit if any mirror drifts or is missing, or if any rule
 * references a file/script that no longer exists.
 */
export function runCheck({ cwd = process.cwd(), quiet = false }: CommandOptions = {}): CheckResult {
  const config = loadConfig(cwd);
  const srcPath = join(cwd, config.source);
  if (!existsSync(srcPath)) {
    throw new Error(`${config.source} not found. Run \`lockstep init\` first.`);
  }

  const doc = parse(readFileSync(srcPath, 'utf8'));
  const outputs = renderTargets(doc, config.targets);

  const existing = new Map<string, string | null>();
  for (const output of outputs) {
    const abs = join(cwd, output.path);
    existing.set(output.path, existsSync(abs) ? readFileSync(abs, 'utf8') : null);
  }

  const drift = detectDrift(outputs, existing);
  const stale = checkReferences(doc, buildRepoIndex(cwd), config.ignore);
  const ok = drift.every((d) => d.status === 'ok') && stale.length === 0;

  if (!quiet) {
    title('lockstep check');
    for (const d of drift) {
      if (d.status === 'ok') {
        console.log(`  ${sym.ok} ${d.path}`);
      } else if (d.status === 'missing') {
        console.log(`  ${sym.err} ${d.path} ${dim('(missing — run `lockstep sync`)')}`);
      } else {
        console.log(`  ${sym.err} ${d.path} ${dim('(drifted — run `lockstep sync`)')}`);
      }
    }
    for (const s of stale) {
      console.log(`  ${sym.err} ${s.message} ${dim(`(line ${s.reference.line})`)}`);
    }
    console.log(ok ? dim('\nIn sync.') : dim('\nProblems found — see above.'));
  }

  return { ok, drift, stale };
}
