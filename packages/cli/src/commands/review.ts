import { title, dim } from '../report';

/**
 * `review` is the paid, opt-in AI feature (CLAUDE.md Phase 3): Haiku-class,
 * prompt-cached, always showing a human-approvable diff — never auto-writing
 * rules. It is intentionally not implemented in the OSS CLI. We say so plainly
 * rather than shipping a fake.
 */
export function runReview(): { available: false } {
  title('agentmirror review');
  console.log(dim('  AI-assisted review (suggest bloat cuts, detect likely-stale rules) is a'));
  console.log(dim('  paid, opt-in feature on the roadmap (Phase 3). It will use a Haiku-class'));
  console.log(dim('  model with prompt caching and always show a diff for you to approve —'));
  console.log(dim('  it will never rewrite your rules for you.'));
  return { available: false };
}
