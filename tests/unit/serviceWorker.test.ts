import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Service Worker Script (public/sw.js)", () => {
  const swPath = path.resolve(process.cwd(), "public/sw.js");
  const swCode = fs.readFileSync(swPath, "utf-8");

  it("exists and defines versioned cache buckets", () => {
    expect(fs.existsSync(swPath)).toBe(true);
    expect(swCode).toMatch(/const VERSION\s*=\s*['"]v1['"]/);
    expect(swCode).toContain("shell-");
    expect(swCode).toContain("static-");
    expect(swCode).toContain("data-");
  });

  it("precaches offline.html, manifest, icons, and localized routes", () => {
    expect(swCode).toContain("/offline.html");
    expect(swCode).toContain("/manifest.webmanifest");
    expect(swCode).toContain("/icons/icon-192.png");
    expect(swCode).toContain("/icons/icon-512.png");
    expect(swCode).toContain("/icons/icon-maskable-512.png");

    // All locales
    expect(swCode).toContain('"en"');
    expect(swCode).toContain('"as"');
    expect(swCode).toContain('"hi"');

    // Main routes
    expect(swCode).toContain('"/emergency"');
    expect(swCode).toContain('"/guides"');
    expect(swCode).toContain('"/alerts"');
    expect(swCode).toContain('"/shelters"');
  });

  it("cleans up old caches during activate", () => {
    expect(swCode).toContain('addEventListener("activate"');
    expect(swCode).toContain("caches.keys()");
    expect(swCode).toContain("caches.delete");
    expect(swCode).toContain("self.clients.claim()");
  });

  it("enforces never caching non-GET requests", () => {
    expect(swCode).toMatch(/request\.method\s*!==\s*['"]GET['"]/);
  });

  it("implements Section 21.3 strategies", () => {
    // 1. Navigation with offline.html fallback
    expect(swCode).toContain('request.mode === "navigate"');
    expect(swCode).toContain("/offline.html");

    // 2. Next.js hashed static assets runtime cache-first
    expect(swCode).toContain("/_next/static/");

    // 3. Guides, helplines, districts data cache-first with background update
    expect(swCode).toContain("/api/districts");
    expect(swCode).toContain("cacheFirstWithBackgroundUpdate");

    // 4. Stale-while-revalidate for alerts and shelters
    expect(swCode).toContain("/api/alerts");
    expect(swCode).toContain("/api/shelters");
    expect(swCode).toContain("staleWhileRevalidate");

    // 5. Network-first for reports
    expect(swCode).toContain("/api/reports");
    expect(swCode).toContain("networkFirst");
  });
});
