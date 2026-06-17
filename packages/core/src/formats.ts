import type { FormatDef, OutputFile } from './types';
import { BANNER, withBanner } from './banner';
import { parse, firstTitle } from './parse';

/**
 * The format registry. Adding a tool = adding an entry here (or, later, loading
 * one from config). No `if (tool === 'cursor')` branches anywhere else.
 *
 * Mapping is authoritative per CLAUDE.md "Verified facts":
 *   AGENTS.md (canonical) → CLAUDE.md, .cursor/rules, .github/copilot-instructions.md,
 *   GEMINI.md, .windsurfrules, .clinerules.  Codex reads AGENTS.md natively (no mirror).
 */

/** A plain-markdown mirror: canonical content verbatim, plus the banner. */
function markdownMirror(id: string, name: string, tool: string, path: string): FormatDef {
  return {
    id,
    name,
    tool,
    render: (doc) => [{ path, content: withBanner(doc.raw) }],
  };
}

/**
 * Cursor's modern format: `.cursor/rules/*.mdc` with YAML frontmatter.
 * `alwaysApply: true` makes the rule always-on, which matches AGENTS.md intent.
 */
const cursor: FormatDef = {
  id: 'cursor',
  name: 'Cursor',
  tool: 'Cursor',
  render: (doc, ctx) => {
    const description = ctx.title ?? 'Project agent rules (synced from AGENTS.md)';
    const frontmatter = [
      '---',
      `description: ${description}`,
      'globs:',
      'alwaysApply: true',
      '---',
    ].join('\n');
    const content = `${frontmatter}\n${BANNER}\n\n${doc.raw.replace(/\s+$/, '')}\n`;
    return [{ path: '.cursor/rules/agents.mdc', content }];
  },
};

export const FORMATS: Record<string, FormatDef> = {
  claude: markdownMirror('claude', 'Claude Code', 'Claude Code', 'CLAUDE.md'),
  cursor,
  'cursor-legacy': markdownMirror('cursor-legacy', 'Cursor (legacy)', 'Cursor', '.cursorrules'),
  copilot: markdownMirror('copilot', 'GitHub Copilot', 'GitHub Copilot', '.github/copilot-instructions.md'),
  gemini: markdownMirror('gemini', 'Gemini CLI', 'Gemini', 'GEMINI.md'),
  windsurf: markdownMirror('windsurf', 'Windsurf', 'Windsurf', '.windsurfrules'),
  cline: markdownMirror('cline', 'Cline', 'Cline', '.clinerules'),
};

/** Targets enabled by default. `cursor-legacy` is opt-in to avoid two Cursor files. */
export const DEFAULT_TARGETS = ['claude', 'cursor', 'copilot', 'gemini', 'windsurf', 'cline'];

/** Output path(s) a target writes, for help text and reporting (no doc needed). */
export function targetOutputPaths(id: string): string[] {
  const f = FORMATS[id];
  return f ? f.render(parse(''), {}).map((o) => o.path) : [];
}

/** Render the given targets from a parsed document. */
export function renderTargets(
  doc: ReturnType<typeof parse>,
  targets: string[],
): OutputFile[] {
  const ctx = { title: firstTitle(doc) };
  const out: OutputFile[] = [];
  for (const id of targets) {
    const fmt = FORMATS[id];
    if (!fmt) {
      throw new Error(
        `Unknown format "${id}". Known: ${Object.keys(FORMATS).join(', ')}.`,
      );
    }
    out.push(...fmt.render(doc, ctx));
  }
  return out;
}
