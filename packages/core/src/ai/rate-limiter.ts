export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async waitForToken(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    const waitTime = (1 - this.tokens) / this.refillRate * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    this.refill();
    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}

export class RateLimiterManager {
  private limiters = new Map<string, RateLimiter>();

  getLimiter(provider: string): RateLimiter {
    if (!this.limiters.has(provider)) {
      // Default rate limits (can be configured per provider)
      const limits: Record<string, { max: number; rate: number }> = {
        openai: { max: 60, rate: 1 }, // 60 requests per minute
        anthropic: { max: 50, rate: 0.83 }, // ~50 per minute
        google: { max: 60, rate: 1 },
        xai: { max: 60, rate: 1 },
        local: { max: 1000, rate: 100 }, // No limit for local
      };

      const config = limits[provider] || { max: 60, rate: 1 };
      this.limiters.set(provider, new RateLimiter(config.max, config.rate));
    }

    return this.limiters.get(provider)!;
  }
}

export const rateLimiterManager = new RateLimiterManager();

