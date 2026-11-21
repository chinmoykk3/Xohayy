import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

// Configure default test environment salt
process.env.RATE_LIMIT_SALT = "test_salt_for_vitest_runs_12345";
