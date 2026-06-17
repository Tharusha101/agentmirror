import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, lint } from '@lockstep/core';
import type { LintFinding } from '@lockstep/core';
import { loadConfig } from '../config';
import { buildRepoIndex } from '../fs-utils';
import { sym, title, dim } from '../report';
import type { CommandOptions } from './sync';

export interface LintResult {
  ok: boolean;
  findings: LintFinding[];
}

/** Flag bloat and stale references; suggest cuts. Errors fail the command. */
export function runLint({ cwd = process.cwd(), quiet = false }: CommandOptions = {}): LintResult {
  const config = loadConfig(cwd);
  const srcPath = join(cwd, config.source);
  if (!existsSync(srcPath)) {
    throw new Error(`${config.source} not found. Run \`lockstep init\` first.`);
  }

  const doc = parse(readFileSync(srcPath, 'utf8'));
  const findings = lint(doc, { ...config.lint, ignore: config.ignore }, buildRepoIndex(cwd));
  const ok = !findings.some((f) => f.severity === 'error');

  if (!quiet) {
    title('lockstep lint');
    if (findings.length === 0) {
      console.log(dim('  Lean and clean — no findings.'));
    } else {
      for (const f of findings) {
        const mark = f.severity === 'error' ? sym.err : sym.warn;
        const where = f.line ? dim(` (line ${f.line})`) : '';
        console.log(`  ${mark} ${f.message}${where} ${dim(`[${f.rule}]`)}`);
      }
    }
  }

  return { ok, findings };
}
