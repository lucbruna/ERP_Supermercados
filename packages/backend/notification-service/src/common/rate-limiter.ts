export class RateLimiter {
  private windows = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly limit: number, private readonly windowMs: number) {}

  check(key: string): boolean {
    const now = Date.now();
    const entry = this.windows.get(key);
    if (!entry || now > entry.resetAt) {
      this.windows.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (entry.count >= this.limit) return false;
    entry.count++;
    return true;
  }

  reset(key: string): void {
    this.windows.delete(key);
  }
}
