import { resolve } from 'node:path';
import { Command } from 'commander';
import pc from 'picocolors';
import { runInit } from './commands/init';
import { runSync } from './commands/sync';
import { runCheck } from './commands/check';
import { runLint } from './commands/lint';
import { runReview } from './commands/review';

const VERSION = '0.1.0';

const program = new Command();

program
  .name('agentmirror')
  .description('One canonical AGENTS.md, synced to every AI coding tool — drift-checked and lean.')
  .version(VERSION)
  .option('--cwd <dir>', 'run as if started in <dir>');

function cwd(): string {
  const dir = program.opts<{ cwd?: string }>().cwd;
  return dir ? resolve(dir) : process.cwd();
}

function fail(err: unknown): void {
  console.error(pc.red(`✗ ${err instanceof Error ? err.message : String(err)}`));
  process.exitCode = 1;
}

program
  .command('init')
  .description('Create a canonical AGENTS.md and agentmirror.config.json (you curate them).')
  .option('-y, --yes', 'non-interactive: accept defaults, never prompt')
  .action(async (opts: { yes?: boolean }) => {
    try {
      await runInit({ cwd: cwd(), yes: opts.yes });
    } catch (err) {
      fail(err);
    }
  });

program
  .command('sync')
  .description('Regenerate every mirror file from AGENTS.md.')
  .action(() => {
    try {
      runSync({ cwd: cwd() });
    } catch (err) {
      fail(err);
    }
  });

program
  .command('check')
  .description('CI gate: fail if mirrors drift or rules reference missing files.')
  .action(() => {
    try {
      if (!runCheck({ cwd: cwd() }).ok) process.exitCode = 1;
    } catch (err) {
      fail(err);
    }
  });

program
  .command('lint')
  .description('Flag bloat and stale references; suggest cuts.')
  .action(() => {
    try {
      if (!runLint({ cwd: cwd() }).ok) process.exitCode = 1;
    } catch (err) {
      fail(err);
    }
  });

program
  .command('review')
  .description('(paid, opt-in) AI suggests tightening — shows a diff to approve.')
  .action(() => {
    runReview();
  });

program.parseAsync().catch(fail);
