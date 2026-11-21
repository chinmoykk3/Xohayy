# ADR 003: Service Worker Caching Strategy for Offline-First Disaster Resilience

## Status

Accepted

## Context

Xahay is an emergency assistant designed for communities in North East India facing monsoon floods and landslides. During natural disasters, telecommunications infrastructure is frequently severed or overloaded, resulting in degraded 2G connectivity or total network outages.

Citizens require instant, reliable access to emergency numbers (112, 108, 101, 1070), disaster survival guides (flood, landslide), and shelter locations without network dependency after their first visit. Concurrently, dynamic data such as water level warnings and shelter capacity must update as soon as connectivity resumes, without corrupting client state or interrupting emergency tasks.

## Decision

We implement a custom Service Worker (`public/sw.js`) with versioned cache buckets and partitioned caching strategies tailored to resource volatility and critical emergency requirements (matching Build Plan Section 21.3):

### 1. Versioned Cache Buckets

- `shell-v1`: Core application shell, offline fallback HTML, web manifest, and primary localized navigation routes.
- `static-v1`: Immutable Next.js hashed assets (`/_next/static/*`), PWA icons, and media files.
- `data-v1`: Static dataset endpoints and cached dynamic API responses (`/api/*`).

On service worker activation, all outdated cache keys not matching the current active version are pruned automatically, followed by `self.clients.claim()` for seamless control.

### 2. Strategy Matrix

| Resource Category                                                               | Strategy                                                      | Primary Bucket | Rationale                                                                                                                                                                    |
| :------------------------------------------------------------------------------ | :------------------------------------------------------------ | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offline Fallback** (`/offline.html`, manifest, icons)                         | Precache on install                                           | `shell-v1`     | Guaranteed zero-network fallback available immediately after install.                                                                                                        |
| **Main Locale Routes** (`/{locale}/`, emergency, guides, alerts, shelters, kit) | Precache on install & runtime update                          | `shell-v1`     | Ensures complete multi-lingual offline capability across English, Assamese, and Hindi.                                                                                       |
| **Hashed Static Assets** (`/_next/static/*`)                                    | Cache-first at runtime                                        | `static-v1`    | Next.js content-hashed bundles are immutable; serving from cache eliminates latency.                                                                                         |
| **Guides, Helplines & Districts Data** (`/api/districts`, `/data/*`)            | Cache-first with background update                            | `data-v1`      | Core reference data rarely changes but must never fail during an emergency.                                                                                                  |
| **Alerts & Shelters API** (`GET /api/alerts`, `GET /api/shelters`)              | Stale-while-revalidate                                        | `data-v1`      | Instantly display the latest available ground status, while quietly syncing updates in the background.                                                                       |
| **Community Reports** (`GET /api/reports`)                                      | Network-first, fallback to cache                              | `data-v1`      | Freshness takes priority for user-submitted field reports.                                                                                                                   |
| **Report Submissions & Non-GET Requests** (`POST /api/reports`, etc.)           | Network only (Never cache)                                    | None           | Mutating operations must never be cached by the service worker (untransmitted reports are stored in client-side queues).                                                     |
| **Document Navigations** (`request.mode === 'navigate'`)                        | Network-first, fallback to cached route, then `/offline.html` | `shell-v1`     | Delivers live pages when online; serves cached localized routes when offline; presents standalone emergency telephone directory if navigating to an unvisited route offline. |

### 3. Production-Only Registration

To avoid interfering with Hot Module Replacement and fast iteration during development, the Service Worker is registered exclusively in production environments (`process.env.NODE_ENV === "production"`) via the `<ServiceWorkerRegister />` client component mounted in the root locale layout.

### 4. Standalone Offline Fallback Page (`public/offline.html`)

The offline fallback page is an unbundled, zero-dependency HTML document with inline styles. It presents:

- Direct, uninhibited `<a href="tel:112">` calling links for national emergency services.
- Verified helplines (108 Ambulance, 101 Fire, 100 Police, 1070 Disaster Management, 1079 Flood Control) labeled in English, Assamese, and Hindi.
- An intuitive connection retry link with reload functionality.

## Consequences

### Positive

- **Guaranteed Lifeline**: Users can access emergency contacts and safety instructions in their chosen language with zero network connectivity.
- **Fast Load Times**: Precached assets and cache-first strategies ensure instant page loads on 2G and erratic cellular networks.
- **Honest Data Presentation**: Stale data is served immediately while revalidation proceeds silently without jarring layout shifts.
- **Resilient Fallback**: Uncached navigation attempts while completely offline resolve gracefully to a fully functional phone directory rather than a browser dinosaur error.

### Trade-offs & Mitigations

- **Cache Invalidation Overhead**: Requires cache version bumps (`VERSION = 'v2'`) on breaking schema changes. This is mitigated through automated old-cache pruning during the `activate` event.
- **Storage Consumption**: Precached assets are bounded strictly to critical routes and high-priority static files to remain within device storage quotas (<5 MB).
