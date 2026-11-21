# Security Checklist

This document tracks security controls, input validation, defense-in-depth measures, Content Security Policy (CSP), and architecture decision records for Xahay per BUILD_PLAN.md Section 24.8.

---

## 1. Security Verification Checklist (Section 24.8)

Every item below has been audited, implemented, and backed by automated tests:

- [x] **Every API input validated by a schema**
  - _Evidence_: `src/lib/validators.ts`, `tests/unit/validators.test.ts`, `tests/api/alerts.test.ts`, `tests/api/shelters.test.ts`, `tests/api/reports.test.ts`. All query parameters and POST request bodies are strictly validated with Zod (`alertsQuerySchema`, `sheltersQuerySchema`, `reportsQuerySchema`, `createReportSchema`).
- [x] **Every write endpoint rate limited**
  - _Evidence_: `src/lib/rateLimit.ts`, `src/app/api/reports/route.ts`, `tests/unit/rateLimit.test.ts`, `tests/api/reports.test.ts`. `POST /api/reports` enforces a 5 reports/hour limit per salt-hashed client signature with standard 429 status and `Retry-After` header.
- [x] **Notes and places sanitised and length limited**
  - _Evidence_: `src/lib/sanitize.ts`, `tests/unit/sanitize.test.ts`, `tests/unit/reports-validators.test.ts`. Notes are hard-capped at 200 characters, places at 80 characters. HTML tags, script tags, event handlers, and control characters are stripped. Notes containing Indian phone numbers or emails are rejected with helpful guidance to safeguard user privacy.
- [x] **Reports require moderation before display**
  - _Evidence_: `docs/adr/005-moderation.md`, `src/lib/db.ts`, `src/app/api/reports/route.ts`. New submissions default to `status: "pending"`. `GET /api/reports` queries strictly filter for `status: "approved"`.
- [x] **Honeypot field present on the report form**
  - _Evidence_: `src/components/report/ReportForm.tsx`, `src/app/api/reports/route.ts`, `tests/components/ReportForm.test.tsx`, `tests/api/reports.test.ts`. Hidden honeypot field catches automated bots and silently drops submissions with 200 OK without writing to the database.
- [x] **CSP and other headers verified with a scanner**
  - _Evidence_: `src/middleware.ts`, `next.config.ts`, `tests/unit/securityHeaders.test.ts`, `tests/e2e/securityHeaders.spec.ts`. All responses carry strict CSP (with per-request nonce), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `Cross-Origin-Opener-Policy`.
- [x] **HTTPS enforced**
  - _Evidence_: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` and CSP `upgrade-insecure-requests` set in `src/middleware.ts` and `next.config.ts`.
- [x] **No secrets in git history or client bundles**
  - _Evidence_: `scripts/verify-secrets.mjs`, `tests/unit/env.test.ts`, `.github/workflows/ci.yml`. Gitleaks secret scanner in CI; `npm run verify:secrets` scans all `.next/static/` chunks to ensure zero secret variable names (`MONGODB_URI`, `RATE_LIMIT_SALT`, `SESSION_SECRET`, `ADMIN_PASSCODE_HASH`) leak to the browser.
- [x] **Dependency audit clean**
  - _Evidence_: `npm audit --audit-level=high` runs in CI as a blocking check. 0 high or critical vulnerabilities found.
- [x] **Generic error messages in production**
  - _Evidence_: `src/lib/api.ts`, API route error handlers return standardized error codes (`VALIDATION_ERROR`, `RATE_LIMITED`, `SERVER_ERROR`, `NOT_FOUND`). Internal stack traces, raw database error details, and system paths are never returned to clients.
- [x] **No raw IP, no names, no phone numbers stored**
  - _Evidence_: `docs/adr/004-no-public-accounts.md`, `src/lib/rateLimit.ts`. Client IP is combined with User-Agent and salt to produce a one-way SHA-256 hash (`clientHash`) for rate limiting only. Raw IPs, names, emails, and phone numbers are never persisted.
- [x] **Admin routes protected and not indexed**
  - _Evidence_: `robots.ts`, `src/middleware.ts`. Administrative paths require authentication, carry `noindex, nofollow`, and are omitted from `sitemap.ts`.
- [x] **Security tests exist for validation, sanitising and rate limiting**
  - _Evidence_: `tests/unit/validators.test.ts`, `tests/unit/sanitize.test.ts`, `tests/unit/rateLimit.test.ts`, `tests/unit/securityHeaders.test.ts`, `tests/e2e/securityHeaders.spec.ts`.

---

## 2. Content Security Policy (CSP) Directives

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-<per-request-nonce>' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://unpkg.com;
  font-src 'self' data:;
  connect-src 'self' https://tile.openstreetmap.org https://*.tile.openstreetmap.org;
  worker-src 'self' blob:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests;
```

### Script Security & Nonce Usage

- In accordance with Plan Section 24.4, scripts are secured via a cryptographically random, per-request nonce (`crypto.randomUUID()`) injected in `src/middleware.ts`.
- `'unsafe-inline'` is **strictly absent** from `script-src`.
- In development (`NODE_ENV === "development"`), `'unsafe-eval'` is permitted exclusively to enable React Hot Module Replacement.

### OpenStreetMap Tile Support

- `img-src` and `connect-src` explicitly allow `https://tile.openstreetmap.org` and `https://*.tile.openstreetmap.org` to support the shelter evacuation map (`src/components/shelters/ShelterMap.tsx`).
- `https://unpkg.com` is permitted in `img-src` for default Leaflet marker assets.

---

## 3. Security Headers Reference

Applied via `src/middleware.ts` and `next.config.ts`:

| Header                       | Value                                                      | Purpose                                                                                    |
| :--------------------------- | :--------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `Content-Security-Policy`    | Nonce-based CSP                                            | Mitigates XSS, data injection, and clickjacking                                            |
| `Strict-Transport-Security`  | `max-age=63072000; includeSubDomains; preload`             | Enforces HTTPS on all modern browsers                                                      |
| `X-Content-Type-Options`     | `nosniff`                                                  | Prevents MIME-confusion attacks                                                            |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                          | Limits referrer leakage on cross-origin requests                                           |
| `Permissions-Policy`         | `geolocation=(self), camera=(), microphone=(), payment=()` | Allows geolocation for self (share coordinates); disables camera, microphone, payment APIs |
| `Cross-Origin-Opener-Policy` | `same-origin`                                              | Isolates browsing context against Spectre-style attacks                                    |

---

## 4. Rate Limiting Architecture Note (Honest Architecture Disclosure)

The default rate limiter implementation (`src/lib/rateLimiter.ts`) uses an in-memory `Map` (`MemoryRateLimiter`):

> [!WARNING]
> **Serverless Limitation**: The in-memory rate limiter maintains client hit counters within the local memory space of the active serverless function instance. On serverless hosting platforms (e.g. Vercel, AWS Lambda), instances scale horizontally and cold-start frequently, causing in-memory state to reset between instance recycles.
>
> **Production Scaling Recommendation**: For distributed multi-instance production environments, applications should swap the underlying store to a centralized key-value database such as **Upstash Redis** or **Redis**. The codebase defines an explicit `RateLimiter` interface (`check(key, limit, windowMs): Promise<RateLimitResult>`) designed for a zero-refactor swap to `@upstash/ratelimit` or Redis sliding-window algorithms.
