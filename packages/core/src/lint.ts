import type { AgentsDoc, LintFinding, LintOptions, RepoIndex } from './types';
import { checkReferences } from './references';

const DEFAULT_MAX_LINES = 200;
const DEFAULT_MAX_CHARS = 12_000;

/**
 * Lint for leanness. These are heuristic, non-AI checks (budget, structure,
 * stale references). The semantic "this line just restates the code" judgement
 * is the opt-in AI `review` (Phase 3) — we don't fake it here.
 *
 * Pass `repo` to also surface stale references as `error`-severity findings.
 */
export function lint(
  doc: AgentsDoc,
  options: LintOptions = {},
  repo?: RepoIndex,
): LintFinding[] {
  const findings: LintFinding[] = [];
  const maxLines = options.maxLines ?? DEFAULT_MAX_LINES;
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;

  const lineCount = doc.raw.split(/\r?\n/).length;
  if (lineCount > maxLines) {
    findings.push({
      rule: 'budget-lines',
      severity: 'warn',
      message: `AGENTS.md is ${lineCount} lines (budget ${maxLines}). Cut rules that restate the code.`,
    });
  }
  if (doc.raw.length > maxChars) {
    findings.push({
      rule: 'budget-chars',
      severity: 'warn',
      message: `AGENTS.md is ${doc.raw.length} characters (budget ${maxChars}).`,
    });
  }

  doc.sections.forEach((section, i) => {
    if (!section.heading || section.body.trim() !== '') return;
    // A heading whose content lives in nested subsections is a container, not
    // an empty section — only flag headings with no body and no children.
    const next = doc.sections[i + 1];
    const hasChildren = next !== undefined && next.level > section.level;
    if (hasChildren) return;
    findings.push({
      rule: 'empty-section',
      severity: 'warn',
      message: `Section "${section.heading}" is empty — fill it or remove it.`,
      line: section.startLine,
    });
  });

  const seen = new Map<string, number>();
  for (const section of doc.sections) {
    if (!section.heading) continue;
    const key = section.heading.toLowerCase();
    if (seen.has(key)) {
      findings.push({
        rule: 'duplicate-heading',
        severity: 'warn',
        message: `Duplicate heading "${section.heading}" (first seen on line ${seen.get(key)}).`,
        line: section.startLine,
      });
    } else {
      seen.set(key, section.startLine);
    }
  }

  if (repo) {
    for (const stale of checkReferences(doc, repo, options.ignore)) {
      findings.push({
        rule: 'stale-reference',
        severity: 'error',
        message: stale.message,
        line: stale.reference.line,
      });
    }
  }

  return findings;
}
