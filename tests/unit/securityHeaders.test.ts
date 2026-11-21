import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { generateCsp, applySecurityHeaders, middleware } from "@/middleware";

describe("Security Headers (Plan Sections 24.4, ADR-003, ADR-005)", () => {
  it("generates a valid Content-Security-Policy with per-request nonce without unsafe-inline for scripts", () => {
    const nonce = "test-random-nonce-12345";
    const csp = generateCsp(nonce);

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`);

    // Must NOT contain unsafe-inline for scripts
    const scriptDirective = csp.split(";").find((d) => d.trim().startsWith("script-src"));
    expect(scriptDirective).toBeDefined();
    expect(scriptDirective).not.toContain("'unsafe-inline'");

    // Required security boundaries
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("object-src 'none'");

    // OpenStreetMap tile hosts allowed for maps
    expect(csp).toContain("https://tile.openstreetmap.org");
    expect(csp).toContain("https://*.tile.openstreetmap.org");
  });

  it("applies all required security headers to response headers", () => {
    const headers = new Headers();
    const csp = "default-src 'self'";
    applySecurityHeaders(headers, csp);

    expect(headers.get("Content-Security-Policy")).toBe(csp);
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toBe(
      "geolocation=(self), camera=(), microphone=(), payment=()"
    );
    expect(headers.get("Strict-Transport-Security")).toContain("max-age=63072000");
    expect(headers.get("Strict-Transport-Security")).toContain("includeSubDomains");
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });

  it("middleware sets security headers and generates a unique nonce on localized routes", () => {
    const req1 = new NextRequest("http://localhost:3000/en");
    const res1 = middleware(req1);

    expect(res1.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res1.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(res1.headers.get("Permissions-Policy")).toBe(
      "geolocation=(self), camera=(), microphone=(), payment=()"
    );
    expect(res1.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");

    const csp1 = res1.headers.get("Content-Security-Policy");
    expect(csp1).toBeDefined();
    expect(csp1).toContain("script-src 'self' 'nonce-");

    // Per-request nonce uniqueness check
    const req2 = new NextRequest("http://localhost:3000/en");
    const res2 = middleware(req2);
    const csp2 = res2.headers.get("Content-Security-Policy");

    expect(csp1).not.toBe(csp2);
  });

  it("middleware sets security headers on API routes", () => {
    const req = new NextRequest("http://localhost:3000/api/alerts");
    const res = middleware(req);

    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("Content-Security-Policy")).toBeDefined();
  });

  it("middleware preserves security headers on redirects", () => {
    const req = new NextRequest("http://localhost:3000/");
    const res = middleware(req);

    expect(res.status).toBe(307); // NextResponse.redirect default
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Content-Security-Policy")).toBeDefined();
  });
});
