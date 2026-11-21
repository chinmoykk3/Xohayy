# Xahay (সহায়)

**Offline-first emergency help for floods and landslides in North East India.**

[![CI](https://github.com/OWNER/xahay/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/xahay/actions)
![License](https://img.shields.io/badge/license-MIT-blue)

> Xahay means "help" in Assamese. The app answers three questions when disaster strikes: **What do I do now? Who do I call and where do I go? What is happening in my district?**

Live demo: `[add URL]` · Demo video: `[add URL]`

---

## Table of contents

1. [The problem](#the-problem)
2. [The solution](#the-solution)
3. [Features](#features)
4. [How the project meets the judging criteria](#how-the-project-meets-the-judging-criteria)
5. [Architecture](#architecture)
6. [Tech stack](#tech-stack)
7. [Getting started](#getting-started)
8. [Environment variables](#environment-variables)
9. [Scripts](#scripts)
10. [Project structure](#project-structure)
11. [Testing](#testing)
12. [Security](#security)
13. [Accessibility](#accessibility)
14. [Performance](#performance)
15. [Languages](#languages)
16. [Data sources and limitations](#data-sources-and-limitations)
17. [Roadmap](#roadmap)
18. [Contributing](#contributing)
19. [License](#license)

---

## The problem

Floods and landslides hit Assam and the wider North East every year. During an event:

- mobile networks and power fail, so online-only tools stop working;
- many people use low-end Android phones on slow, expensive data;
- official information is often in English, and rumours spread faster than verified facts;
- people under stress cannot read long pages, and some cannot read well at all.

## The solution

Xahay is a Progressive Web App (PWA) built for the worst conditions: no signal, a cheap phone, and a person in a hurry. After one visit, the essential content works with no network. Everything is available in **English, Assamese and Hindi**.

Design principles:

1. **Emergency first.** 112 is one tap away from every screen.
2. **Offline by default.** Critical content is cached on the device.
3. **Honest data.** Every alert and listing shows its source and last-updated time. Demo data is always labelled.
4. **Local language first.**
5. **Calm, accessible design.** Light colours, large text, plain language.
6. **Minimal data.** No accounts, no tracking, no personal data stored.

## Features

### Tier 1: Core (offline capable)

| Feature                             | Description                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Emergency panel                     | Always-visible button. One tap to call 112, ambulance, police, fire, state disaster helpline and the district control room. |
| Share my location                   | On request only. Builds a message with a map link to send by WhatsApp or SMS, or to copy.                                   |
| District selection                  | Searchable, remembered on the device.                                                                                       |
| Safety guides                       | Before, during and after guides for floods and landslides, with per-step progress.                                          |
| Read-aloud                          | Reads guides and alerts aloud using the device's speech engine, with clear fallbacks.                                       |
| Emergency kit                       | Printable, tickable checklist saved on the device.                                                                          |
| Language and accessibility settings | Language, text size, high contrast and reduced motion.                                                                      |

### Tier 2: Connected

| Feature                | Description                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| District alerts        | Risk level, hazard, source, issue time and expiry. Expired alerts hidden by default.                                                            |
| Shelters and hospitals | Search and filter, with call, copy-address and open-in-maps actions.                                                                            |
| Community reports      | Moderated reports of road blocks, rising water and landslides. Reports made offline are queued and sent automatically when the network returns. |
| Offline status         | Clear banner showing when saved information was last updated.                                                                                   |

### Tier 3: Extended

| Feature     | Description                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Shelter map | Loaded only on demand, so it does not slow the app. The list always remains as an accessible alternative. |
| Admin tools | Passcode-protected moderation queue and alert publishing.                                                 |

## How the project meets the judging criteria

| Criterion                   | What we did                                                                                                                 | Evidence                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Problem statement alignment | Built specifically for flood and landslide response in North East India. Offline, local languages, low-end device friendly. | [Problem](#the-problem), [Features](#features)                  |
| Code quality                | TypeScript strict mode, ESLint with zero warnings, Prettier, Husky hooks, small modules, logic separated from UI, ADRs.     | `docs/adr/`, CI                                                 |
| Security                    | Server-side validation, sanitisation, rate limiting, moderation, strict CSP and headers, no personal data.                  | [Security](#security), `docs/security-checklist.md`             |
| Efficiency                  | Server components by default, lazy-loaded heavy features, cached data, bundle budget enforced in CI.                        | [Performance](#performance), `docs/performance-report.md`       |
| Testing                     | Unit, API, component, end-to-end, offline and accessibility tests run in CI.                                                | [Testing](#testing)                                             |
| Accessibility               | WCAG 2.2 AA target, keyboard and screen-reader support, 48px touch targets, adjustable text and contrast.                   | [Accessibility](#accessibility), `docs/accessibility-report.md` |

## Architecture

```
            +-------------------------------+
            |        Browser (PWA)          |
            |  Next.js UI  +  Service Worker|
            |  localStorage / IndexedDB     |
            +---------------+---------------+
                            |  HTTPS
            +---------------v---------------+
            |   Next.js server (Vercel)     |
            |  Pages (static + server)      |
            |  API routes: /api/alerts      |
            |  /api/shelters /api/reports   |
            |  /api/districts /api/health   |
            +---------------+---------------+
                            |
          +-----------------v------------------+
          |  Repository layer (swappable)      |
          |  Seed JSON  |  MongoDB (optional)  |
          +------------------------------------+
```

**Key decisions** (full records in `docs/adr/`):

- **Offline first.** A service worker precaches the shell and key routes, and caches data with strategies suited to each type.
- **Repository interfaces.** The app runs without a database using bundled seed data. MongoDB can be switched on by setting one variable.
- **No public accounts.** Reports are anonymous and moderated before they appear.
- **Dictionary-based i18n.** Simple JSON dictionaries, no heavy library.

### Caching strategy

| Content                           | Strategy                                        |
| --------------------------------- | ----------------------------------------------- |
| App shell, offline page, icons    | Precached on install                            |
| Next.js hashed assets             | Cache first (runtime)                           |
| Guides, helplines, districts      | Cache first with background update              |
| Alerts and shelters API           | Stale-while-revalidate                          |
| Reports API                       | Network first                                   |
| Non-GET requests                  | Never cached                                    |
| Uncached navigation while offline | Falls back to `offline.html` with key helplines |

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS · Zod · MongoDB (optional) · Vitest · React Testing Library · Playwright · axe-core · Lighthouse CI · ESLint · Prettier · Husky · GitHub Actions · Vercel

## Getting started

### Prerequisites

- Node.js 20 or later (LTS)
- npm 10 or later
- Optional: a MongoDB connection string (the app works without one)

### Install and run

```bash
git clone https://github.com/OWNER/xahay.git
cd xahay
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

### Try the offline mode

The service worker is active in production builds only.

```bash
npm run build
npm run start
```

1. Open the app and browse a few pages.
2. In browser DevTools, open Network and choose Offline (or use airplane mode on a phone).
3. Reload. Guides, emergency numbers and saved data still work.

## Environment variables

Copy `.env.example` to `.env.local`. Values are validated at startup, and the app fails fast with a clear message if something is wrong.

| Variable              | Required   | Purpose                                                                         |
| --------------------- | ---------- | ------------------------------------------------------------------------------- |
| `MONGODB_URI`         | No         | Enables MongoDB storage. Without it, an in-memory store and seed data are used. |
| `RATE_LIMIT_SALT`     | Yes        | Random string used to hash client identifiers for rate limiting.                |
| `ADMIN_PASSCODE_HASH` | Admin only | Hash of the admin passcode.                                                     |
| `SESSION_SECRET`      | Admin only | Secret used to sign the admin session cookie.                                   |

Never commit real values. No secret variable may start with `NEXT_PUBLIC_`.

## Scripts

| Command                     | What it does                     |
| --------------------------- | -------------------------------- |
| `npm run dev`               | Start the development server     |
| `npm run build`             | Production build                 |
| `npm run start`             | Serve the production build       |
| `npm run lint` / `lint:fix` | Lint, with zero warnings allowed |
| `npm run format`            | Format with Prettier             |
| `npm run typecheck`         | TypeScript check                 |
| `npm test`                  | Unit, API and component tests    |
| `npm run test:coverage`     | Tests with coverage report       |
| `npm run test:e2e`          | Playwright end-to-end tests      |
| `npm run audit`             | Dependency vulnerability audit   |
| `npm run lhci`              | Lighthouse CI with budgets       |

## Project structure

```
xahay/
  docs/                 Architecture, ADRs, reports, demo script
  public/               Service worker, offline page, icons
  src/
    app/[locale]/       Pages (home, alerts, guides, shelters, report, kit, about, admin)
    app/api/            Route handlers
    components/         ui, layout, emergency, alerts, guides, shelters, reports, settings
    lib/                Pure logic: alerts, validation, sanitising, rate limiting, geo, speech, db
    hooks/              Preferences, online status, speech, district
    data/               Seed data and guide content
    i18n/               en, as, hi dictionaries
    types/              Shared types
  tests/                unit, api, components, e2e
```

## Testing

| Layer         | Tool                  | Covers                                                                         |
| ------------- | --------------------- | ------------------------------------------------------------------------------ |
| Unit          | Vitest                | Alert filtering, validation, sanitising, rate limiting, geo and format helpers |
| API           | Vitest                | Status codes, validation errors, rate limits, no stack traces                  |
| Component     | React Testing Library | Dialog focus, forms, toggles, offline banner, read-aloud                       |
| End-to-end    | Playwright            | Main user journey, language switching, offline behaviour, queued reports       |
| Accessibility | axe-core              | Every main route in all three languages                                        |
| Performance   | Lighthouse CI         | Mobile budgets enforced in CI                                                  |

Current results: coverage on logic code `[X%]` · tests `[N passing]` · axe violations `[0 serious/critical]`.

CI runs lint, typecheck, all tests, build, audit, secret scanning and Lighthouse on every push.

## Security

- All input validated on the server with Zod schemas, with size and content-type limits.
- Text sanitised and HTML stripped. No raw HTML is ever rendered.
- Reports are anonymous, rate limited per client and district, protected by a honeypot field, and held for moderation before publication.
- Client identifiers are salted and hashed. Raw IP addresses are never stored or logged.
- Strict Content-Security-Policy with per-request nonce, plus HSTS, frame, referrer and permissions policies.
- Generic error messages. No stack traces or internals exposed.
- Admin area uses a signed, httpOnly, sameSite-strict cookie, constant-time passcode comparison, origin checks and login rate limiting.
- Dependency audit and secret scanning in CI.

See `docs/security-checklist.md` for the full checklist and evidence.

**Known limitation:** the default in-memory rate limiter resets between serverless invocations. For production, swap in a shared store (for example Upstash Redis) through the existing `RateLimiter` interface.

## Accessibility

Targeting **WCAG 2.2 Level AA**.

- Skip link, logical headings, landmarks and unique page titles.
- Fully keyboard operable, with visible focus and focus management in dialogs.
- Risk levels use text and icons as well as colour.
- Touch targets of at least 48 by 48 px.
- Text size (100, 125, 150 percent), high contrast and reduced motion controls.
- Works at 320 px width and 200 percent zoom.
- Layouts tested with longer Assamese and Hindi text.
- Plain-language, short sentences written to be read aloud.

Measured contrast values and test results are in `docs/accessibility-report.md`. Manual screen-reader testing results: `[add after testing with NVDA or TalkBack]`.

## Performance

| Metric                                      | Target         | Measured |
| ------------------------------------------- | -------------- | -------- |
| Lighthouse performance (mobile)             | 90 or more     | `[X]`    |
| First-load JavaScript (main route, gzipped) | 150 KB or less | `[X KB]` |
| Largest Contentful Paint (slow 4G)          | under 2.5 s    | `[X s]`  |
| Cumulative Layout Shift                     | under 0.1      | `[X]`    |

Techniques: server components by default, lazy-loaded read-aloud, map and admin, subsetted fonts, no icon fonts, no images that are not needed, cached data endpoints. Before and after numbers: `docs/performance-report.md`.

## Languages

| Language          | Status                  | Reviewed by             |
| ----------------- | ----------------------- | ----------------------- |
| English           | Complete                | n/a                     |
| Assamese (অসমীয়া) | Complete, machine draft | `[reviewer name, date]` |
| Hindi (हिन्दी)     | Complete, machine draft | `[reviewer name, date]` |

Read-aloud uses the voices installed on the user's device. Many phones have no Assamese voice, so the app falls back to Hindi with a visible notice, or to text only.

## Data sources and limitations

- **Alerts, shelters and hospitals** in this version are **sample data**, clearly labelled as demo in the interface.
- **Helpline numbers** are listed in `docs/data-verification.md` with verification dates. Confirm them against official government sources before real-world use.
- Xahay **complements** official channels and does not replace them. In an emergency, call **112**.
- Community reports are unverified user input, moderated before publication.
- Risk levels come from the data source. Xahay does not forecast.

To connect real data, implement the `AlertsRepository` and `FacilitiesRepository` interfaces in `src/lib/db.ts` for an official feed.

## Roadmap

- Live integration with official state and district alert feeds
- SMS alerts for people without data
- More languages (Bodo, Bengali, Manipuri and others)
- Shared rate limiter and monitoring for production
- Native-speaker review of all translations
- More hazards (earthquake, cyclone)
- District control room partnerships

## Contributing

Contributions are welcome. Please read `CONTRIBUTING.md`, use conventional commit messages, and make sure `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass before opening a pull request.

## License

MIT. See [LICENSE](LICENSE).

Map data, if enabled: © OpenStreetMap contributors.
