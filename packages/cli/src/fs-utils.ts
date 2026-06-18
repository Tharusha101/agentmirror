import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { RepoIndex } from '@agentmirror/core';

/** Directories we never descend into when indexing the repo. */
const IGNORE = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.turbo', '.cache',
]);

/** Convert a native path to POSIX form so the index matches AGENTS.md tokens. */
export function toPosix(p: string): string {
  return p.split(sep).join('/');
}

/** Walk the repo, collecting POSIX-relative file and directory paths. */
export function walkRepo(cwd: string): Pick<RepoIndex, 'files' | 'dirs'> {
  const files = new Set<string>();
  const dirs = new Set<string>();

  const walk = (abs: string): void => {
    let entries;
    try {
      entries = readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORE.has(entry.name)) continue;
      const full = join(abs, entry.name);
      const rel = toPosix(relative(cwd, full));
      if (entry.isDirectory()) {
        dirs.add(rel);
        walk(full);
      } else if (entry.isFile()) {
        files.add(rel);
      }
    }
  };

  walk(cwd);
  return { files, dirs };
}

/** Read script names from the repo-root package.json (empty set if none). */
export function readScripts(cwd: string): Set<string> {
  const path = join(cwd, 'package.json');
  if (!existsSync(path)) return new Set();
  try {
    const pkg = JSON.parse(readFileSync(path, 'utf8')) as { scripts?: Record<string, string> };
    return new Set(Object.keys(pkg.scripts ?? {}));
  } catch {
    return new Set();
  }
}

/** Build a full repo index for reference checking. */
export function buildRepoIndex(cwd: string): RepoIndex {
  return { ...walkRepo(cwd), scripts: readScripts(cwd) };
}
