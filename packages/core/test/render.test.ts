import { describe, it, expect } from 'vitest';
import { renderTargets, FORMATS, DEFAULT_TARGETS, targetOutputPaths } from '../src/formats';
import { parse } from '../src/parse';
import { BANNER } from '../src/banner';

const doc = parse('# Demo\n\nKeep it lean.\n');

describe('renderTargets', () => {
  it('renders the default targets to their canonical paths', () => {
    const paths = renderTargets(doc, DEFAULT_TARGETS).map((o) => o.path).sort();
    expect(paths).toEqual(
      [
        '.clinerules',
        '.cursor/rules/agents.mdc',
        '.github/copilot-instructions.md',
        '.windsurfrules',
        'CLAUDE.md',
        'GEMINI.md',
      ].sort(),
    );
  });

  it('prepends the banner to plain-markdown mirrors', () => {
    const claude = renderTargets(doc, ['claude'])[0]!;
    expect(claude.content.startsWith(BANNER)).toBe(true);
    expect(claude.content).toContain('Keep it lean.');
    expect(claude.content.endsWith('\n')).toBe(true);
  });

  it('renders Cursor as .mdc with frontmatter and the H1 as description', () => {
    const cursor = renderTargets(doc, ['cursor'])[0]!;
    expect(cursor.path).toBe('.cursor/rules/agents.mdc');
    expect(cursor.content).toContain('alwaysApply: true');
    expect(cursor.content).toContain('description: Demo');
  });

  it('is deterministic', () => {
    expect(renderTargets(doc, DEFAULT_TARGETS)).toEqual(renderTargets(doc, DEFAULT_TARGETS));
  });

  it('throws on an unknown format', () => {
    expect(() => renderTargets(doc, ['nope'])).toThrow(/Unknown format/);
  });
});

describe('format registry', () => {
  it('exposes a legacy Cursor target that is off by default', () => {
    expect(FORMATS['cursor-legacy']).toBeDefined();
    expect(DEFAULT_TARGETS).not.toContain('cursor-legacy');
    expect(targetOutputPaths('cursor-legacy')).toEqual(['.cursorrules']);
  });
});
