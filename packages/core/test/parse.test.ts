import { describe, it, expect } from 'vitest';
import { parse, sectionize, firstTitle } from '../src/parse';

describe('sectionize', () => {
  it('splits markdown into heading-delimited sections', () => {
    const sections = sectionize('# Title\n\nIntro\n\n## Setup\n\nRun it.');
    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({ heading: 'Title', level: 1, startLine: 1 });
    expect(sections[1]).toMatchObject({ heading: 'Setup', level: 2, startLine: 5 });
    expect(sections[1]!.body.trim()).toBe('Run it.');
  });

  it('keeps a non-empty preamble before the first heading', () => {
    const sections = sectionize('Some preamble\n\n# Title\n');
    expect(sections[0]!.heading).toBeNull();
    expect(sections[0]!.body.trim()).toBe('Some preamble');
  });

  it('ignores heading-like lines inside fenced code blocks', () => {
    const sections = sectionize('# Real\n\n```\n# not a heading\n```\n');
    expect(sections).toHaveLength(1);
    expect(sections[0]!.heading).toBe('Real');
  });
});

describe('firstTitle', () => {
  it('returns the first H1', () => {
    expect(firstTitle(parse('## Sub\n\n# Main\n'))).toBe('Main');
  });
  it('returns undefined when there is no H1', () => {
    expect(firstTitle(parse('## Only a sub\n'))).toBeUndefined();
  });
});

describe('parse', () => {
  it('attaches extracted references', () => {
    const doc = parse('Build with `npm run build`.');
    expect(doc.references).toEqual([
      expect.objectContaining({ kind: 'script', value: 'build' }),
    ]);
  });
});
