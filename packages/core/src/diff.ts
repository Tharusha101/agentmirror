import type { DriftResult, OutputFile } from './types';

/**
 * Normalise line endings before comparison. Without this, a CRLF checkout on
 * Windows would report every mirror as drifted — exactly the cross-platform
 * trap CLAUDE.md warns about.
 */
export function normalize(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

/**
 * Compare freshly rendered mirrors against what's on disk.
 * `existing` maps a path to its current content, or `null` if absent.
 */
export function detectDrift(
  rendered: OutputFile[],
  existing: Map<string, string | null>,
): DriftResult[] {
  return rendered.map((file) => {
    const current = existing.get(file.path);
    if (current == null) return { path: file.path, status: 'missing' };
    const status = normalize(current) === normalize(file.content) ? 'ok' : 'drift';
    return { path: file.path, status };
  });
}
