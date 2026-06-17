import pc from 'picocolors';

export const sym = {
  ok: pc.green('✓'),
  add: pc.green('+'),
  warn: pc.yellow('!'),
  err: pc.red('✗'),
  dot: pc.dim('·'),
};

export function title(text: string): void {
  console.log(pc.bold(text));
}

export function dim(text: string): string {
  return pc.dim(text);
}
