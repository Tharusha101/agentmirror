import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import prompts from 'prompts';
import { DEFAULT_TARGETS, FORMATS, stripBanner, targetOutputPaths } from '@lockstep/core';
import { CONFIG_FILE, defaultConfig } from '../config';
import { sym, title, dim } from '../report';

/** A lean starter the human then curates — Lockstep never auto-generates rules. */
const TEMPLATE = `# AGENTS.md

> Canonical AI-agent context for this project. Edit this file, then run \`lockstep sync\`
> to update every tool's mirror. Keep it lean — every line must earn its place.

## Project

<One paragraph: what this project is and what it does.>

## Setup

- Install: \`npm install\`
- Build: \`npm run build\`
- Test: \`npm test\`

## Conventions

- <Conventions an agent must follow that it can't infer from the code.>

## Do / Don't

- **Do:** <...>
- **Don't:** <...>
`;

/** Existing context files we can offer to import as a starting point. */
const IMPORT_CANDIDATES = [
  'CLAUDE.md',
  '.cursorrules',
  '.github/copilot-instructions.md',
  'GEMINI.md',
  '.windsurfrules',
  '.clinerules',
];

export interface InitOptions {
  cwd?: string;
  /** Non-interactive: use defaults, never prompt. */
  yes?: boolean;
  quiet?: boolean;
}

export interface InitResult {
  source: string | null;
  config: string;
  targets: string[];
}

export async function runInit({ cwd = process.cwd(), yes = false, quiet = false }: InitOptions = {}): Promise<InitResult> {
  const srcPath = join(cwd, 'AGENTS.md');
  let content = TEMPLATE;
  let writeSource = true;

  if (existsSync(srcPath)) {
    if (yes) {
      writeSource = false; // never clobber an existing source non-interactively
    } else {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: 'AGENTS.md already exists. Overwrite it?',
        initial: false,
      });
      writeSource = overwrite === true;
    }
  } else if (!yes) {
    const found = IMPORT_CANDIDATES.filter((f) => existsSync(join(cwd, f)));
    if (found.length > 0) {
      const { source } = await prompts({
        type: 'select',
        name: 'source',
        message: 'Found existing context files. Start AGENTS.md from one? (you can edit after)',
        choices: [
          { title: 'Blank template', value: '' },
          ...found.map((f) => ({ title: f, value: f })),
        ],
      });
      if (source) content = stripBanner(readFileSync(join(cwd, source), 'utf8'));
    }
  }

  let targets = [...DEFAULT_TARGETS];
  if (!yes) {
    const { selected } = await prompts({
      type: 'multiselect',
      name: 'selected',
      message: 'Which tool formats should lockstep keep in sync?',
      min: 1,
      instructions: false,
      choices: Object.values(FORMATS)
        .filter((f) => f.id !== 'cursor-legacy')
        .map((f) => ({
          title: `${f.name} ${dim(`→ ${targetOutputPaths(f.id).join(', ')}`)}`,
          value: f.id,
          selected: DEFAULT_TARGETS.includes(f.id),
        })),
    });
    if (Array.isArray(selected) && selected.length > 0) targets = selected;
  }

  if (writeSource) writeFileSync(srcPath, content, 'utf8');
  const config = { ...defaultConfig(), targets };
  writeFileSync(join(cwd, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  if (!quiet) {
    title('lockstep init');
    console.log(`  ${sym.ok} ${writeSource ? 'AGENTS.md' : 'AGENTS.md (kept existing)'}`);
    console.log(`  ${sym.ok} ${CONFIG_FILE} ${dim(`(${targets.length} target(s))`)}`);
    console.log(dim('\nNext: edit AGENTS.md, then run `lockstep sync`.'));
  }

  return { source: writeSource ? 'AGENTS.md' : null, config: CONFIG_FILE, targets };
}
