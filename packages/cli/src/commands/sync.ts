import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parse, renderTargets, normalize } from '@lockstep/core';
import { loadConfig } from '../config';
import { sym, title, dim } from '../report';

export type WriteStatus = 'created' | 'updated' | 'unchanged';

export interface SyncResult {
  written: { path: string; status: WriteStatus }[];
}

export interface CommandOptions {
  cwd?: string;
  /** Suppress console output (used in tests). */
  quiet?: boolean;
}

/** Regenerate every mirror file from the canonical source. */
export function runSync({ cwd = process.cwd(), quiet = false }: CommandOptions = {}): SyncResult {
  const config = loadConfig(cwd);
  const srcPath = join(cwd, config.source);
  if (!existsSync(srcPath)) {
    throw new Error(`${config.source} not found. Run \`lockstep init\` first.`);
  }

  const doc = parse(readFileSync(srcPath, 'utf8'));
  const outputs = renderTargets(doc, config.targets);
  const written: SyncResult['written'] = [];

  for (const output of outputs) {
    const abs = join(cwd, output.path);
    const next = normalize(output.content);
    const prev = existsSync(abs) ? normalize(readFileSync(abs, 'utf8')) : null;

    let status: WriteStatus;
    if (prev === null) status = 'created';
    else if (prev === next) status = 'unchanged';
    else status = 'updated';

    if (status !== 'unchanged') {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, next, 'utf8');
    }
    written.push({ path: output.path, status });
  }

  if (!quiet) {
    title('lockstep sync');
    for (const w of written) {
      const mark = w.status === 'unchanged' ? sym.dot : sym.ok;
      console.log(`  ${mark} ${w.path} ${dim(`(${w.status})`)}`);
    }
    const changed = written.filter((w) => w.status !== 'unchanged').length;
    console.log(dim(`\n${changed} file(s) written from ${config.source}.`));
  }

  return { written };
}
