// Generates an asciinema v2 cast of the AgentMirror CLI demo.
// It actually runs the CLI in a throwaway repo, so the output is real.
//
//   node demo/gen-cast.mjs
//   asciinema play demo/agentmirror-demo.cast      # watch it
//   agg demo/agentmirror-demo.cast demo/agentmirror-demo.gif   # -> GIF
import { execSync } from 'node:child_process';
import {
  mkdtempSync, writeFileSync, appendFileSync, readFileSync, mkdirSync, rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CLI = `node "${join(ROOT, 'packages', 'cli', 'dist', 'index.js')}"`;
const OUT = join(ROOT, 'demo', 'agentmirror-demo.cast');

const work = mkdtempSync(join(tmpdir(), 'am-cast-'));
const events = [];
let t = 0;

const PROMPT = '\x1b[36m$\x1b[0m ';
const round = (x) => Math.round(x * 1000) / 1000;
const crlf = (s) => s.replace(/\r?\n/g, '\r\n');
const push = (s) => events.push([round(t), 'o', s]);

function comment(s) {
  push(`\x1b[2m${s}\x1b[0m\r\n`);
  t += 0.7;
}
function type(display) {
  push(PROMPT);
  for (const ch of display) {
    push(ch);
    t += 0.045;
  }
  push('\r\n');
  t += 0.35;
}
function cat(file) {
  type(`cat ${file}`);
  push(crlf(readFileSync(join(work, file), 'utf8')));
  t += 1;
}
function edit(display, fn) {
  type(display);
  fn();
  t += 0.5;
}
function run(display, exec, showExit = false) {
  type(display);
  let out = '';
  let code = 0;
  try {
    out = execSync(exec, { cwd: work, env: { ...process.env, FORCE_COLOR: '1' } }).toString();
  } catch (e) {
    out = (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : '');
    code = e.status ?? 1;
  }
  if (out) push(crlf(out));
  if (showExit) {
    t += 0.2;
    push(`\x1b[2mexit code: ${code}\x1b[0m\r\n`);
  }
  t += 1.2;
}

// --- scaffold the "messy" starting repo -------------------------------------
mkdirSync(join(work, 'src'), { recursive: true });
writeFileSync(join(work, 'src', 'index.ts'), 'export const x = 1;\n');
writeFileSync(join(work, 'package.json'), '{ "name": "acme", "scripts": { "build": "tsc" } }\n');
writeFileSync(join(work, 'CLAUDE.md'), '# Project rules\n- Indent with TABS.\n');
writeFileSync(join(work, '.cursorrules'), '# Project rules\n- Indent with SPACES.\n');

// --- the cast ----------------------------------------------------------------
push('\x1b[1;36mAgentMirror\x1b[0m \x1b[2m— one AGENTS.md, synced to every AI tool\x1b[0m\r\n\r\n');
t += 1.2;

comment('# You use Claude Code AND Cursor. Same rules, two files:');
cat('CLAUDE.md');
cat('.cursorrules');

comment('# They already contradict each other. Consolidate into one AGENTS.md:');
writeFileSync(
  join(work, 'AGENTS.md'),
  [
    '# Acme — Agent Guide',
    '',
    '> Canonical context. Edit here, then run `agentmirror sync`.',
    '',
    '## Conventions',
    '- Indent with spaces (2) — one answer for every tool.',
    '- Entry point is `src/index.ts`; build with `npm run build`.',
    '',
  ].join('\n'),
);
writeFileSync(
  join(work, 'agentmirror.config.json'),
  JSON.stringify({ source: 'AGENTS.md', targets: ['claude', 'cursor-legacy'] }, null, 2) + '\n',
);
cat('AGENTS.md');

comment("# Generate every tool's file from it:");
run('agentmirror sync', `${CLI} sync`);

comment('# In sync — and CI keeps it that way:');
run('agentmirror check', `${CLI} check`, true);

comment('# Someone hand-edits a generated mirror...');
edit('echo "- actually, use tabs" >> CLAUDE.md', () =>
  appendFileSync(join(work, 'CLAUDE.md'), '- actually, use tabs\n'),
);
run('agentmirror check', `${CLI} check`, true);

comment('# Re-sync fixes it:');
run('agentmirror sync', `${CLI} sync`);
run('agentmirror check', `${CLI} check`, true);

comment("# Stale rules get caught too — reference a file that doesn't exist:");
edit('echo "- see `src/ghost.ts`" >> AGENTS.md', () =>
  appendFileSync(join(work, 'AGENTS.md'), '- see `src/ghost.ts` for details.\n'),
);
run('agentmirror sync', `${CLI} sync`);
run('agentmirror check', `${CLI} check`, true);

comment('# One file to edit. Every tool in sync. Drift caught in CI.');
t += 0.4;
push('\x1b[32m$\x1b[0m npm install -g agentmirror\r\n');
t += 1.5;

// --- write the cast ----------------------------------------------------------
const header = {
  version: 2,
  width: 96,
  height: 30,
  timestamp: Math.floor(Date.now() / 1000),
  title: 'AgentMirror — one AGENTS.md, synced to every AI tool',
  env: { TERM: 'xterm-256color' },
};
const lines = [JSON.stringify(header), ...events.map((e) => JSON.stringify(e))];
writeFileSync(OUT, lines.join('\n') + '\n');
rmSync(work, { recursive: true, force: true });

console.log(`Wrote ${OUT} (${events.length} events, ~${round(t)}s).`);
