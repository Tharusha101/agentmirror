/** Format a raw widget part number as `AC-0000`. */
export function formatPartNumber(n: number): string {
  return `AC-${String(n).padStart(4, '0')}`;
}
