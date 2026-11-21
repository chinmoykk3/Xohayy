import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().url("MONGODB_URI must be a valid URL").optional(),
  RATE_LIMIT_SALT: z
    .string()
    .min(8, "RATE_LIMIT_SALT is required and must be at least 8 characters"),
  ADMIN_PASSCODE_HASH: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["en", "as", "hi"]).default("en"),
  NEXT_PUBLIC_MAP_TILE_URL: z.string().optional(),
  ALERT_FEED_CACHE_TTL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates environment variables and throws immediately with a readable error on failure.
 * Strict security rule: Any variable containing secret keywords must never use NEXT_PUBLIC_ prefix.
 */
export function getEnv(customEnv?: Record<string, string | undefined>): Env {
  const source = customEnv ?? (typeof process !== "undefined" ? process.env : {});

  // Security check: audit all keys for forbidden NEXT_PUBLIC_ leaks
  for (const key of Object.keys(source)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      const lower = key.toLowerCase();
      if (
        lower.includes("secret") ||
        lower.includes("salt") ||
        lower.includes("passcode") ||
        lower.includes("mongo") ||
        lower.includes("password")
      ) {
        throw new Error(
          `Security violation: Secret variable "${key}" cannot start with NEXT_PUBLIC_ prefix`
        );
      }
    }
  }

  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `[${issue.path.join(".") || "env"}]: ${issue.message}`)
      .join("\n  ");
    throw new Error(`Environment validation failed at startup:\n  ${issues}`);
  }

  return parsed.data;
}

export function validateEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = getEnv();
  }
  return cachedEnv;
}
