// Lightweight ID generator — no dependency needed
export function nanoid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
