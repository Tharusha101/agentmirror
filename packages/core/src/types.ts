/**
 * Shared types for the AgentMirror core engine.
 *
 * The engine is pure: it never touches the filesystem. Callers (the CLI, the
 * GitHub App) read files, hand strings + a repo index to these functions, and
 * write the results back. This keeps the engine trivially unit-testable.
 */

/** A heading-delimited block of an AGENTS.md document. */
export interface Section {
  /** Heading text, or `null` for the preamble before the first heading. */
  heading: string | null;
  /** Heading depth (1–6); `0` for the preamble. */
  level: number;
  /** Text under the heading, excluding the heading line itself. */
  body: string;
  /** 1-based line number of the heading (or 1 for the preamble). */
  startLine: number;
}

/** Something a rule points at that should exist in the repo. */
export type ReferenceKind = 'file' | 'script';

export interface Reference {
  kind: ReferenceKind;
  /** Normalised target: a POSIX path for files, a script name for scripts. */
  value: string;
  /** The original token as written, e.g. `npm run build` or `src/index.ts`. */
  raw: string;
  /** 1-based line number where the reference appears. */
  line: number;
}

/** The parsed canonical document. */
export interface AgentsDoc {
  /** Original source text, verbatim. */
  raw: string;
  sections: Section[];
  references: Reference[];
}

/** A file a format plugin wants written, relative to the repo root (POSIX). */
export interface OutputFile {
  path: string;
  content: string;
}

/** Context passed to a format's renderer. */
export interface RenderContext {
  /** First H1 heading of the document, if any (used where a format wants a title). */
  title?: string;
}

/**
 * A target format. New tools are added by registering a `FormatDef` — the rule
 * "make formats config/plugin-driven" lives here, not in `if` branches.
 */
export interface FormatDef {
  /** Stable id used in config, e.g. `claude`. */
  id: string;
  /** Human name, e.g. `Claude Code`. */
  name: string;
  /** Owning tool/vendor, for reporting. */
  tool: string;
  /** Produce the mirror file(s) for this format. Usually one; Cursor differs. */
  render(doc: AgentsDoc, ctx: RenderContext): OutputFile[];
}

/** A flat index of the repo, supplied by the caller for reference checking. */
export interface RepoIndex {
  /** All file paths, POSIX-relative to the repo root. */
  files: Set<string>;
  /** All directory paths, POSIX-relative to the repo root. */
  dirs: Set<string>;
  /** Script names from package.json `scripts`. */
  scripts: Set<string>;
}

/** A rule that points at something missing from the repo. */
export interface StaleFinding {
  reference: Reference;
  message: string;
}

export type DriftStatus = 'ok' | 'drift' | 'missing';

export interface DriftResult {
  path: string;
  status: DriftStatus;
}

export type LintSeverity = 'warn' | 'error';

export interface LintFinding {
  /** Rule id, e.g. `budget-lines`, `stale-reference`. */
  rule: string;
  severity: LintSeverity;
  message: string;
  line?: number;
}

export interface LintOptions {
  /** Soft cap on total lines before we warn about bloat. */
  maxLines?: number;
  /** Soft cap on total characters before we warn about bloat. */
  maxChars?: number;
  /**
   * Glob patterns for references to skip in stale-reference checks — for
   * illustrative or planned paths a doc legitimately mentions (`apps/**`,
   * example format files, etc.). Supports `*` (one segment) and `**` (any).
   */
  ignore?: string[];
}
