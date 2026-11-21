import { describe, expect, it } from "vitest";
import { getEnv } from "@/lib/env";

describe("Environment Configuration & Security Audit", () => {
  it("successfully parses valid environment variables", () => {
    const validEnv = {
      NODE_ENV: "test",
      RATE_LIMIT_SALT: "secure_rate_salt_12345",
      MONGODB_URI: "mongodb://localhost:27017/xahay",
      NEXT_PUBLIC_DEFAULT_LOCALE: "en",
    };

    const env = getEnv(validEnv);
    expect(env.RATE_LIMIT_SALT).toBe("secure_rate_salt_12345");
    expect(env.NEXT_PUBLIC_DEFAULT_LOCALE).toBe("en");
  });

  it("fails fast with clear message when RATE_LIMIT_SALT is missing", () => {
    const invalidEnv = {
      NODE_ENV: "test",
    };

    expect(() => getEnv(invalidEnv)).toThrowError(
      /Environment validation failed at startup:\s+\[RATE_LIMIT_SALT\]/
    );
  });

  it("fails fast when RATE_LIMIT_SALT is too short", () => {
    const invalidEnv = {
      RATE_LIMIT_SALT: "short",
    };

    expect(() => getEnv(invalidEnv)).toThrowError(
      /RATE_LIMIT_SALT is required and must be at least 8 characters/
    );
  });

  it("fails fast if a secret variable is erroneously prefixed with NEXT_PUBLIC_", () => {
    const insecureEnv = {
      RATE_LIMIT_SALT: "secure_salt_value_123",
      NEXT_PUBLIC_SALT_SECRET: "leaked_secret",
    };

    expect(() => getEnv(insecureEnv)).toThrowError(/Security violation: Secret variable/);
  });
});
