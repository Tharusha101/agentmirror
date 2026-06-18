import { parse, renderTargets, lint, DEFAULT_TARGETS } from '@agentmirror/core';
import type { OutputFile, LintFinding } from '@agentmirror/core';

const SAMPLE = `# Acme Widgets — Agent Guide

> Canonical context for AI coding agents. Edit this file; every tool's mirror is
> generated from it. Keep it lean — every line must earn its place.

## Setup
- Install: \`npm install\`
- Build: \`npm run build\`

## Conventions
- Source lives in \`src/\`; tests sit next to the code they cover.
- Indent with spaces (2) — the single answer for every tool.

## Do / Don't
- **Do:** add a test with every behavior change.
- **Don't:** edit the generated mirror files by hand.
`;

const sourceEl = document.querySelector<HTMLTextAreaElement>('#source')!;
const tabsEl = document.querySelector<HTMLDivElement>('#tabs')!;
const mirrorEl = document.querySelector<HTMLElement>('#mirror')!;
const lintEl = document.querySelector<HTMLDivElement>('#lint')!;

let outputs: OutputFile[] = [];
let active = 0;

function render(): void {
  const doc = parse(sourceEl.value);

  // Mirrors
  try {
    outputs = renderTargets(doc, DEFAULT_TARGETS);
  } catch {
    outputs = [];
  }
  if (active >= outputs.length) active = 0;

  tabsEl.replaceChildren(
    ...outputs.map((file, i) => {
      const btn = document.createElement('button');
      btn.textContent = file.path;
      btn.className = i === active ? 'tab active' : 'tab';
      btn.onclick = () => {
        active = i;
        paint();
      };
      return btn;
    }),
  );
  paint();

  // Lint (leanness + structure; stale-reference checks need a repo, so they
  // run in CI rather than here).
  const findings = lint(doc, { maxLines: 200, maxChars: 12_000 });
  renderLint(findings);
}

function paint(): void {
  mirrorEl.textContent = outputs[active]?.content ?? '';
  for (const [i, btn] of [...tabsEl.children].entries()) {
    btn.className = i === active ? 'tab active' : 'tab';
  }
}

function renderLint(findings: LintFinding[]): void {
  if (findings.length === 0) {
    lintEl.innerHTML = '<span class="ok">✓ Lean &amp; clean — no lint findings.</span>';
    return;
  }
  lintEl.replaceChildren(
    ...findings.map((f) => {
      const row = document.createElement('div');
      row.className = `finding ${f.severity}`;
      const where = f.line ? ` (line ${f.line})` : '';
      row.textContent = `${f.severity === 'error' ? '✗' : '!'} ${f.message}${where}`;
      return row;
    }),
  );
}

sourceEl.value = SAMPLE;
sourceEl.addEventListener('input', render);
render();
