// Minimal className joiner (no dependency needed for our usage).
export function cn(...values) {
  return values.flat().filter(Boolean).join(' ');
}
