import { createHash } from "node:crypto";

/**
 * Rate Limiting interface and in-memory implementation.
 * Conforms to Sections 19, 24.3, and 26.2 of BUILD_PLAN.md:
 * - 5 reports per client per hour
 * - 20 reports per district per hour
 * - Salted client hash (never logs or stores raw client IP)
 */

export const RATE_LIMITS = {
  REPORTS_PER_CLIENT_PER_HOUR: 5,
  REPORTS_PER_DISTRICT_PER_HOUR: 20,
  WINDOW_ONE_HOUR_MS: 60 * 60 * 1000,
} as const;

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number; // in seconds
  remaining: number;
  resetTime: number; // epoch ms
}

export interface RateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
  reset?(key?: string): Promise<void>;
}

/**
 * In-memory implementation of RateLimiter.
 *
 * NOTE ON SERVERLESS ENVIRONMENTS (Plan Section 24.3, Task 8):
 * In serverless deployments (such as Vercel or AWS Lambda), in-memory Map state
 * is isolated per function container instance and resets across container cold-starts.
 * While this provides adequate defense against single-connection burst floods in lightweight
 * setups, production multi-instance deployments should swap to a shared distributed store
 * such as Upstash Redis or standard Redis via the existing RateLimiter interface.
 */
export class MemoryRateLimiter implements RateLimiter {
  private hits: Map<string, number[]> = new Map();

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const timestamps = this.hits.get(key) || [];

    // Filter out timestamps older than the rolling window
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= limit) {
      const oldest = validTimestamps[0] ?? now;
      const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

      this.hits.set(key, validTimestamps);
      return {
        allowed: false,
        retryAfter,
        remaining: 0,
        resetTime: oldest + windowMs,
      };
    }

    // Record this hit
    validTimestamps.push(now);
    this.hits.set(key, validTimestamps);

    return {
      allowed: true,
      retryAfter: 0,
      remaining: Math.max(0, limit - validTimestamps.length),
      resetTime: now + windowMs,
    };
  }

  async reset(key?: string): Promise<void> {
    if (key) {
      this.hits.delete(key);
    } else {
      this.hits.clear();
    }
  }
}

let rateLimiterInstance: MemoryRateLimiter | null = null;

export function getRateLimiter(): MemoryRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new MemoryRateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Extracts client IP from x-forwarded-for or x-real-ip headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Produces a salted SHA-256 hash of client IP and User Agent.
 * Strict privacy rule: Never stores or logs the raw IP address.
 */
export function hashClient(req: Request): string {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown";
  const salt = process.env.RATE_LIMIT_SALT || "default_local_salt_12345";

  return createHash("sha256").update(`${salt}:${ip}:${userAgent}`).digest("hex");
}
