import type { AgentsDoc, Section } from './types';
import { extractReferences } from './references';

/** Parse canonical AGENTS.md text into a structured document. */
export function parse(raw: string): AgentsDoc {
  return {
    raw,
    sections: sectionize(raw),
    references: extractReferences(raw),
  };
}

/** Split markdown into heading-delimited sections (fence-aware). */
export function sectionize(raw: string): Section[] {
  const lines = raw.split(/\r?\n/);
  const sections: Section[] = [];
  let current: Section = { heading: null, level: 0, body: '', startLine: 1 };
  let bodyLines: string[] = [];
  let inFence = false;

  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const h = inFence ? null : /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      current.body = bodyLines.join('\n');
      sections.push(current);
      current = { heading: h[2]!.trim(), level: h[1]!.length, body: '', startLine: i + 1 };
      bodyLines = [];
    } else {
      bodyLines.push(line);
    }
  });

  current.body = bodyLines.join('\n');
  sections.push(current);

  // Drop an empty leading preamble so an AGENTS.md that opens with a heading
  // doesn't report a phantom section.
  return sections.filter(
    (s, idx) => !(idx === 0 && s.heading === null && s.body.trim() === ''),
  );
}

/** The document's first H1, used by formats that want a title/description. */
export function firstTitle(doc: AgentsDoc): string | undefined {
  return doc.sections.find((s) => s.level === 1 && s.heading)?.heading ?? undefined;
}
