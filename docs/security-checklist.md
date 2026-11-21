# Security Checklist

This document tracks security controls, input validation, defense-in-depth measures, and Content Security Policy (CSP) specifications for Northeast Connect (Xahay) per BUILD_PLAN.md Section 24.8.

---

## 1. Security Verification Checklist

- [x] **Input Validation**: Every API input validated by a Zod schema (`src/lib/validators.ts`).
- [ ] **Rate Limiting**: Every write endpoint rate limited per client key and time window (Phase 16/19).
- [ ] **Sanitisation**: Notes and places sanitised and hard length-limited (`sanitizeText` in `src/lib/validators.ts`).
- [ ] **Moderation**: Community reports require moderation before public display (`status: "pending"`).
- [ ] **Abuse Controls**: Honeypot field present on the report form to block bots.
- [ ] **Security Headers & CSP**: Verified with security scanners; CSP finalised in Phase 20.
- [x] **Transport Security**: HTTPS enforced across production deployments with HSTS.
- [x] **Secret Management**: No secrets, API keys, or credentials in git history or client bundles.
- [x] **Dependency Auditing**: Regular `npm audit` with 0 high/critical vulnerabilities.
- [x] **Error Handling**: Generic safe error messages returned in production API endpoints.
- [x] **Data Privacy**: No accounts, passwords, raw IPs, names, or phone numbers stored.
- [ ] **Admin Route Protection**: Admin routes protected by httpOnly session cookie and excluded with `noindex`.
- [x] **Automated Security Tests**: Validation, sanitisation, and security tests in Vitest suite.

---

## 2. Content Security Policy (CSP) Specifications

> [!NOTE]
> The full Content Security Policy HTTP response headers are finalised and activated in **Phase 20**.

### Phase 15 Tile & Map Requirements (Tier 3 Lazy Shelter Map)

Loading OpenStreetMap tiles in Leaflet (`src/components/shelters/ShelterMap.tsx`) requires explicit CSP directives to permit external map tile downloads while maintaining strict sandboxing:

1. **`img-src` Directive**:

   ```http
   img-src 'self' blob: data: https://*.tile.openstreetmap.org https://tile.openstreetmap.org;
   ```
   - `https://*.tile.openstreetmap.org` and `https://tile.openstreetmap.org`: Required to fetch raster map image tiles (`/{z}/{x}/{y}.png`).
   - `data:`: Required for inline SVG `L.divIcon` markers and data-URI assets.
   - `blob:`: Allowed for client-side raster caching / object URLs.

2. **`connect-src` Directive**:
   ```http
   connect-src 'self' https://*.tile.openstreetmap.org https://tile.openstreetmap.org;
   ```
   - Required if tiles, tile headers, or fallback vector datasets are queried via `fetch` or `XMLHttpRequest`.

### Final CSP Directive Draft (Phase 20)

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.tile.openstreetmap.org https://tile.openstreetmap.org;
  connect-src 'self' https://*.tile.openstreetmap.org https://tile.openstreetmap.org;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
```
