import type { Reference, RepoIndex, StaleFinding, AgentsDoc } from './types';

/**
 * Reference extraction is deliberately conservative: we only look inside code
 * spans (`inline` and ``` fenced ``` blocks). Prose is full of slashes and
 * dotted words that are not paths; flagging those would erode trust, and a
 * drift check is only useful if its findings are almost always real.
 */

const SCRIPT_RE = /\b(?:npm run|pnpm run|yarn run|bun run)\s+([A-Za-z0-9:_\-.]+)/g;

const KNOWN_EXTS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'md', 'mdc', 'yml', 'yaml',
  'toml', 'sh', 'ps1', 'py', 'rs', 'go', 'java', 'rb', 'txt', 'env', 'lock',
  'css', 'scss', 'html', 'sql', 'prisma',
]);

const KNOWN_DOTFILES = new Set([
  '.cursorrules', '.windsurfrules', '.clinerules', '.env', '.gitignore',
  '.npmrc', '.nvmrc', '.editorconfig',
]);

/** Pull file/script references out of the code spans of a document. */
export function extractReferences(raw: string): Reference[] {
  const refs: Reference[] = [];
  const lines = raw.split(/\r?\n/);
  let inFence = false;

  lines.forEach((line, i) => {
    const lineNo = i + 1;
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }

    const spans: string[] = [];
    if (inFence) {
      spans.push(line);
    } else {
      const re = /`([^`]+)`/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) spans.push(m[1]!);
    }

    for (const span of spans) {
      SCRIPT_RE.lastIndex = 0;
      let sm: RegExpExecArray | null;
      while ((sm = SCRIPT_RE.exec(span)) !== null) {
        refs.push({ kind: 'script', value: sm[1]!, raw: sm[0], line: lineNo });
      }

      for (const tokenRaw of span.split(/\s+/)) {
        const token = trimToken(tokenRaw);
        if (token && isFileRef(token)) {
          refs.push({ kind: 'file', value: normalizeRef(token), raw: tokenRaw, line: lineNo });
        }
      }
    }
  });

  return dedupe(refs);
}

/**
 * Compare a document's references against the repo; report the missing ones.
 * References matching an `ignore` glob are skipped (illustrative/planned paths).
 */
export function checkReferences(
  doc: AgentsDoc,
  repo: RepoIndex,
  ignore: string[] = [],
): StaleFinding[] {
  const ignored = ignore.map(globToRegExp);
  const out: StaleFinding[] = [];
  for (const ref of doc.references) {
    if (ignored.some((re) => re.test(ref.value))) continue;
    if (ref.kind === 'script') {
      if (!repo.scripts.has(ref.value)) {
        out.push({ reference: ref, message: `script "${ref.value}" is not defined in package.json` });
      }
    } else if (!pathExists(ref.value, repo)) {
      out.push({ reference: ref, message: `path "${ref.value}" was not found in the repo` });
    }
  }
  return out;
}

function pathExists(value: string, repo: RepoIndex): boolean {
  if (!value) return true; // emptied by glob stripping — nothing to check
  if (repo.files.has(value) || repo.dirs.has(value)) return true;
  const prefix = value.endsWith('/') ? value : `${value}/`;
  for (const f of repo.files) if (f.startsWith(prefix)) return true;
  for (const d of repo.dirs) if (d.startsWith(prefix)) return true;
  return false;
}

function trimToken(t: string): string {
  return t.replace(/^[`'"(\[{<]+/, '').replace(/[`'".,;:!?)\]}>]+$/, '');
}

function isFileRef(token: string): boolean {
  if (/:\/\//.test(token)) return false; // URL
  if (token.startsWith('-')) return false; // CLI flag
  if (token.startsWith('@')) return false; // npm scope / handle
  if (KNOWN_DOTFILES.has(token)) return true;
  if (token.includes('/')) return true;
  const ext = token.includes('.') ? token.split('.').pop()?.toLowerCase() : undefined;
  return ext !== undefined && KNOWN_EXTS.has(ext);
}

function normalizeRef(token: string): string {
  let t = token.replace(/\\/g, '/').replace(/^\.\//, '');
  const star = t.indexOf('*');
  if (star !== -1) t = t.slice(0, star).replace(/\/+$/, '');
  return t.replace(/\/+$/, '');
}

/** Tiny glob → RegExp: `**` matches any depth, `*` matches one path segment. */
function globToRegExp(glob: string): RegExp {
  const g = glob.replace(/\\/g, '/');
  let re = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i]!;
    if (c === '*' && g[i + 1] === '*') {
      // `/**` becomes optional so `apps/**` also matches `apps` itself.
      re = re.endsWith('/') ? `${re.slice(0, -1)}(?:/.*)?` : `${re}.*`;
      i++;
      if (g[i + 1] === '/') i++;
    } else if (c === '*') {
      re += '[^/]*';
    } else {
      re += c.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`);
}

function dedupe(refs: Reference[]): Reference[] {
  const seen = new Set<string>();
  return refs.filter((r) => {
    const key = `${r.kind}:${r.value}:${r.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
