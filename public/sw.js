/**
 * Xahay Service Worker
 * Versioned caches and offline strategies (ADR-003, Section 21.3)
 */

const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const STATIC_CACHE = `static-${VERSION}`;
const DATA_CACHE = `data-${VERSION}`;

const CURRENT_CACHES = [SHELL_CACHE, STATIC_CACHE, DATA_CACHE];

// Core offline assets precached on install
const PRECACHE_ASSETS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

// Core localized routes to precache
const PRECACHE_ROUTES = [
  "/en",
  "/as",
  "/hi",
  "/en/emergency",
  "/en/guides",
  "/en/guides/flood",
  "/en/alerts",
  "/en/shelters",
  "/en/kit",
  "/en/report",
];

// 1. INSTALL LIFECYCLE
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shellCache = await caches.open(SHELL_CACHE);
      // Precache core static shell files
      try {
        await shellCache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn("[SW] Precache assets warning:", err);
      }

      // Precache essential routes cleanly
      for (const route of PRECACHE_ROUTES) {
        try {
          const fullUrl = new URL(route, self.location.origin).toString();
          const res = await fetch(fullUrl, { cache: "no-cache" });
          if (res && res.ok) {
            await shellCache.put(fullUrl, res.clone());
            await shellCache.put(route, res);
          }
        } catch {
          // Silently continue for offline resilience
        }
      }

      // First install: skip waiting automatically once cache is primed
      if (!self.registration || !self.registration.active) {
        self.skipWaiting();
      }
    })()
  );
});

// Message listener for user-triggered skipWaiting (Section 21.7)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 2. ACTIVATE LIFECYCLE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// 3. CACHING STRATEGIES

/**
 * Cache First Strategy
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response("Asset unavailable offline", {
      status: 504,
      statusText: "Gateway Timeout",
    });
  }
}

/**
 * Cache First with Background Update Strategy
 * Serves cached version immediately if available, while fetching update from network.
 */
async function cacheFirstWithBackgroundUpdate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response(JSON.stringify({ error: "Data unavailable offline" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Stale-While-Revalidate Strategy
 * Returns cached response immediately if available, revalidates quietly in background.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return new Response(JSON.stringify({ error: "Endpoint unavailable offline" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Network First Strategy
 * Tries network first; falls back to cache on failure.
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response(
      JSON.stringify({ error: "Network request failed and no cached copy found" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Navigation Strategy: Network First with Cache and offline.html Fallback
 */
async function handleNavigation(request) {
  const url = new URL(request.url);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, networkResponse.clone());
      cache.put(url.pathname, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    // 1. Try matching exact request
    let cached = await cache.match(request);
    if (cached) return cached;

    // 2. Try matching url.pathname
    cached = await cache.match(url.pathname);
    if (cached) return cached;

    // 3. Try matching alternate pathname (with or without trailing slash)
    const altPath = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname + "/";
    cached = await cache.match(altPath);
    if (cached) return cached;

    // 4. Try matching global caches
    cached = await caches.match(request);
    if (cached) return cached;
    cached = await caches.match(url.pathname);
    if (cached) return cached;

    // 5. Uncached first-visit or unvisited route offline -> fallback to offline.html
    const fallback = (await cache.match("/offline.html")) || (await caches.match("/offline.html"));
    if (fallback) {
      return fallback;
    }

    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/html" },
    });
  }
}

// 4. FETCH EVENT DISPATCHER
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never cache non-GET requests (network-only)
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Bypass health check route so useOnlineStatus always checks live server
  if (url.pathname === "/api/health") {
    return;
  }

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // A. Navigations: Network first with offline.html fallback
  if (
    request.mode === "navigate" ||
    (request.headers.get("accept") && request.headers.get("accept").includes("text/html"))
  ) {
    event.respondWith(handleNavigation(request));
    return;
  }

  // B. Next.js hashed static assets at runtime: Cache first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // C. Icons and manifest: Cache first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    request.destination === "image"
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // D. Guides, helplines, districts data: Cache first with background update
  if (
    url.pathname.startsWith("/api/districts") ||
    url.pathname.startsWith("/api/helplines") ||
    url.pathname.startsWith("/api/guides") ||
    url.pathname.startsWith("/data/")
  ) {
    event.respondWith(cacheFirstWithBackgroundUpdate(request, DATA_CACHE));
    return;
  }

  // E. Dynamic data: Stale-While-Revalidate for GET /api/alerts and /api/shelters
  if (url.pathname.startsWith("/api/alerts") || url.pathname.startsWith("/api/shelters")) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  // F. Reports: Network first for /api/reports
  if (url.pathname.startsWith("/api/reports")) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  // G. Other GET requests (e.g. Next.js RSC chunks, fonts, etc.): Cache First or Network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, clone));
        }
        return res;
      });
    })
  );
});
