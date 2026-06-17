import { describe, it, expect } from 'vitest';
import { detectDrift, normalize } from '../src/diff';
import type { OutputFile } from '../src/types';

const rendered: OutputFile[] = [{ path: 'CLAUDE.md', content: 'hello\n' }];

describe('detectDrift', () => {
  it('reports ok when content matches', () => {
    const r = detectDrift(rendered, new Map([['CLAUDE.md', 'hello\n']]));
    expect(r).toEqual([{ path: 'CLAUDE.md', status: 'ok' }]);
  });

  it('reports drift when content differs', () => {
    const r = detectDrift(rendered, new Map([['CLAUDE.md', 'edited\n']]));
    expect(r[0]!.status).toBe('drift');
  });

  it('reports missing when the file is absent', () => {
    const r = detectDrift(rendered, new Map([['CLAUDE.md', null]]));
    expect(r[0]!.status).toBe('missing');
  });

  it('ignores CRLF vs LF differences (cross-platform)', () => {
    const r = detectDrift([{ path: 'a', content: 'one\ntwo\n' }], new Map([['a', 'one\r\ntwo\r\n']]));
    expect(r[0]!.status).toBe('ok');
  });
});

describe('normalize', () => {
  it('converts CRLF to LF', () => {
    expect(normalize('a\r\nb')).toBe('a\nb');
  });
});
