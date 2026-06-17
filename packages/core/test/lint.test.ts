import { describe, it, expect } from 'vitest';
import { lint } from '../src/lint';
import { parse } from '../src/parse';
import type { RepoIndex } from '../src/types';

const emptyRepo: RepoIndex = { files: new Set(), dirs: new Set(), scripts: new Set() };

describe('lint', () => {
  it('warns when over the line budget', () => {
    const doc = parse(Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n'));
    const findings = lint(doc, { maxLines: 10 });
    expect(findings.some((f) => f.rule === 'budget-lines')).toBe(true);
  });

  it('warns about empty sections', () => {
    const findings = lint(parse('# Title\n\n## Empty\n\n## Full\n\ntext\n'));
    const empty = findings.find((f) => f.rule === 'empty-section');
    expect(empty?.message).toContain('Empty');
  });

  it('warns about duplicate headings', () => {
    const findings = lint(parse('## Setup\n\na\n\n## Setup\n\nb\n'));
    expect(findings.some((f) => f.rule === 'duplicate-heading')).toBe(true);
  });

  it('reports stale references as errors when a repo index is given', () => {
    const findings = lint(parse('Run `npm run nope`.'), {}, emptyRepo);
    const stale = findings.find((f) => f.rule === 'stale-reference');
    expect(stale?.severity).toBe('error');
  });

  it('stays quiet on a lean, valid document', () => {
    const findings = lint(parse('# Title\n\nShort and correct.\n'), {}, emptyRepo);
    expect(findings).toHaveLength(0);
  });
});
