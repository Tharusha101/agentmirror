import { describe, it, expect } from 'vitest';
import { extractReferences, checkReferences } from '../src/references';
import { parse } from '../src/parse';
import type { RepoIndex } from '../src/types';

function repo(partial: Partial<RepoIndex>): RepoIndex {
  return {
    files: new Set(),
    dirs: new Set(),
    scripts: new Set(),
    ...partial,
  };
}

describe('extractReferences', () => {
  it('extracts npm/pnpm/yarn run scripts', () => {
    const refs = extractReferences('Use `npm run build` and `pnpm run test`.');
    expect(refs.map((r) => `${r.kind}:${r.value}`)).toEqual(['script:build', 'script:test']);
  });

  it('extracts file paths from code spans', () => {
    const refs = extractReferences('See `packages/core` and `src/index.ts` and `.cursorrules`.');
    expect(refs.map((r) => r.value).sort()).toEqual(['.cursorrules', 'packages/core', 'src/index.ts']);
  });

  it('ignores URLs, flags, and prose outside code spans', () => {
    const refs = extractReferences('Visit `https://x.dev/a` with `--flag`. Not a/path here.');
    expect(refs).toHaveLength(0);
  });

  it('strips globs down to their static prefix', () => {
    const refs = extractReferences('Covers `packages/*` in the build.');
    expect(refs[0]!.value).toBe('packages');
  });
});

describe('checkReferences', () => {
  it('flags scripts missing from package.json', () => {
    const stale = checkReferences(parse('Run `npm run deploy`.'), repo({ scripts: new Set(['build']) }));
    expect(stale).toHaveLength(1);
    expect(stale[0]!.message).toContain('deploy');
  });

  it('passes scripts that exist', () => {
    const stale = checkReferences(parse('Run `npm run build`.'), repo({ scripts: new Set(['build']) }));
    expect(stale).toHaveLength(0);
  });

  it('flags missing paths and accepts directory-prefix matches', () => {
    const doc = parse('Edit `src/index.ts` and `docs/missing.md`.');
    const stale = checkReferences(doc, repo({ files: new Set(['src/index.ts']) }));
    expect(stale).toHaveLength(1);
    expect(stale[0]!.message).toContain('docs/missing.md');
  });

  it('treats a referenced directory as present when files live under it', () => {
    const stale = checkReferences(parse('See `packages/core`.'), repo({ files: new Set(['packages/core/src/index.ts']) }));
    expect(stale).toHaveLength(0);
  });

  it('skips references matching an ignore glob', () => {
    const doc = parse('Future home: `apps/web` and `apps/github-app`.');
    expect(checkReferences(doc, repo({}))).toHaveLength(2);
    expect(checkReferences(doc, repo({}), ['apps/**'])).toHaveLength(0);
  });

  it('ignore matches the bare prefix as well as nested paths', () => {
    const doc = parse('See `apps` and `GEMINI.md`.');
    expect(checkReferences(doc, repo({}), ['apps/**', 'GEMINI.md'])).toHaveLength(0);
  });
});
