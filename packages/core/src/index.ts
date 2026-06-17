/**
 * @lockstep/core — the pure engine shared by the CLI and the GitHub App.
 *
 * Parse a canonical AGENTS.md, render every tool mirror, detect drift, and
 * lint for leanness — all without touching the filesystem.
 */
export * from './types';
export { parse, sectionize, firstTitle } from './parse';
export { extractReferences, checkReferences } from './references';
export { BANNER, withBanner, stripBanner } from './banner';
export { FORMATS, DEFAULT_TARGETS, renderTargets, targetOutputPaths } from './formats';
export { detectDrift, normalize } from './diff';
export { lint } from './lint';
