Northeast Connect: Complete Build Plan
Community Emergency Assistant for floods and landslides in North East India (Problem Statement PS05)
Judging parameters: Code Quality, Security, Efficiency, Testing, Accessibility, Problem Statement Alignment

1. How to Use This Document
• Read sections 2 to 7 once to lock the idea, scope and success criteria.
• Use sections 8 to 13 as the product specification (stories, requirements, stack, architecture).
• Use sections 14 to 20 as the engineering specification (data, pages, components, APIs).
• Use sections 21 to 25 for the cross-cutting qualities (offline, performance, accessibility, security, privacy).
• Use sections 26 to 33 for testing, build order, demo, README, risks and the final checklist.
• Every requirement has an ID (FR-01, NFR-01, US-01) so you can reference it in commits, tests and the README.
• Nothing here depends on a deadline. Build in the order given and stop at any tier boundary with a complete product.
2. Problem Understanding
• Several regions of North East India face floods, landslides and other natural disasters every year.
• During an emergency, communities struggle to reach important safety information and emergency resources.
• The statement asks for a web-based platform that helps people:
o access essential emergency information,
o stay informed,
o connect with relevant assistance during disaster situations.
• The real-world conditions that shape the design:
o Mobile networks drop or become very slow during floods and storms.
o Power cuts drain phones quickly, so battery use matters.
o Many users have low-end Android phones with limited storage.
o Many users read Assamese, Bodo, Bengali, Hindi or other local languages more comfortably than English.
o Some users have low literacy or low vision, and are stressed and in a hurry.
o Rumours and false alarms spread fast, so trust in the information matters.
• Therefore the product is not a news site. It is a calm, fast, offline-capable utility that answers three questions:
o What should I do right now?
o Who do I call and where do I go?
o What is happening in my district?
3. Target Users (Personas)
Persona A: Rina, 34, village resident near the Brahmaputra
• Uses a low-cost Android phone with patchy data.
• Reads Assamese best, some Hindi, little English.
• Needs: know when to move, where the nearest relief camp is, who to call.
• Pain: alerts arrive late, in English, or through rumours on messaging groups.
Persona B: Mr. Das, 62, elderly resident in a town
• Uses a basic smartphone with a large font setting.
• Needs: very large text, simple screens, voice read-aloud, one-tap calling.
• Pain: small text, confusing menus, long forms.
Persona C: Bhaskar, 28, volunteer and local youth club member
• Wants to share verified safety steps and report blocked roads or flooded areas.
• Needs: quick report form, shareable links, district view.
• Pain: no simple channel to pass on ground information.
Persona D: Officer at a district control room (secondary)
• Wants to see what communities are reporting and publish official advisories.
• Needs: moderated reports, a way to publish alerts.
• Note: this persona is served by the optional admin tier, not the core.
4. Product Principles
5. Emergency first: the most urgent action is always reachable in one tap from every screen.
6. Offline by default: every critical feature works with no network.
7. Honest data: always show where information came from and when it was last updated.
8. Local language first: the interface and guides are available in Assamese, Hindi and English.
9. Calm design: high contrast, large touch targets, no clutter, no alarmist animation.
10. Minimal data: collect nothing personal unless the user chooses to share it.
11. Lightweight: small bundle, few images, no heavy libraries.
12. Verifiable engineering: every claim in the pitch is backed by a test, a score or a screenshot.
13. Goals and Non-Goals
Goals
• G1: Let a user find emergency contacts and the right safety steps within 2 taps, offline.
• G2: Let a user check flood and landslide status for their district.
• G3: Let a user find relief shelters and hospitals by district.
• G4: Let a user report a ground condition (road blocked, area flooded) safely.
• G5: Work well on slow networks, small screens and low-end devices.
• G6: Be accessible to people with low vision, low literacy and motor difficulties.
• G7: Demonstrate clean code, tests, security practices and performance with evidence.
Non-goals (state these openly in the pitch as future work)
• N1: Real-time sensor ingestion (IoT water-level or rainfall sensors).
• N2: Machine-learning flood prediction.
• N3: Native mobile apps.
• N4: Public user accounts and login.
• N5: Replacing official government systems. The app complements them and links to them.
14. Mapping the Plan to the Six Judging Parameters
Parameter What judges look for Our evidence
Code Quality Structure, readability, consistency, docs Modular folders, TypeScript, ESLint and Prettier, conventional commits, README, ADRs
Security Safe handling of input, secrets, abuse Validation with a schema, sanitising, rate limiting, security headers, moderation, no personal data
Efficiency Speed, size, resource use Lighthouse performance above 90, small bundle, service worker caching, lazy loading
Testing Tests that prove behaviour Unit tests, API tests, one end-to-end flow, accessibility test, CI badge
Accessibility Usable by everyone WCAG 2.2 AA contrast, keyboard and screen-reader support, large text, read-aloud, local languages
Problem Statement Alignment Solves the stated problem Floods and landslides focus, emergency info, staying informed, connecting to help, offline demo
Success criteria per parameter
Code Quality
• ☐ TypeScript strict mode on, zero type errors.
• ☐ ESLint reports zero errors and zero warnings.
• ☐ Prettier formatting enforced by a pre-commit hook.
• ☐ No file above 250 lines without a reason.
• ☐ Each component has one responsibility.
• ☐ README explains setup, structure, decisions and scores.
• ☐ Commit history uses clear conventional messages.
Security
• ☐ All inputs validated on the server with a schema.
• ☐ Output sanitised before storage and rendering.
• ☐ Rate limiting on every write endpoint.
• ☐ Security headers set (CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
• ☐ Secrets only in environment variables, none in git.
• ☐ Reports are hidden until moderated.
• ☐ No personal data stored, location is shared only on user action.
• ☐ Dependency audit shows no high or critical issues.
Efficiency
• ☐ Lighthouse Performance 90 or above on mobile.
• ☐ First load JavaScript under 150 KB gzipped for the main route.
• ☐ Largest Contentful Paint under 2.5 seconds on simulated slow 4G.
• ☐ All critical features work offline after the first visit.
• ☐ Images are compressed, sized and lazy loaded.
• ☐ No unnecessary third-party scripts.
Testing
• ☐ Unit tests for validation, filtering and formatting logic.
• ☐ API tests for the reports and alerts endpoints, including failure cases.
• ☐ Component tests for the emergency panel and language switcher.
• ☐ One end-to-end test of the main user journey.
• ☐ One automated accessibility check (axe) in CI.
• ☐ Coverage report with a stated percentage.
• ☐ CI runs lint, type check and tests on every push.
Accessibility
• ☐ Text contrast at least 4.5 to 1, large text at least 3 to 1.
• ☐ Touch targets at least 48 by 48 CSS pixels.
• ☐ Full keyboard operation with visible focus.
• ☐ Semantic landmarks, headings in order, labelled controls.
• ☐ Language attribute set per language, including Assamese.
• ☐ Large-text toggle and high-contrast toggle.
• ☐ Read-aloud for guides and alerts.
• ☐ Reduced-motion support.
• ☐ No information conveyed by colour alone.
Problem Statement Alignment
• ☐ The home screen speaks directly to floods and landslides in the North East.
• ☐ Emergency information, staying informed and connecting to help are each a clear feature.
• ☐ Offline demo shows the product working when the network fails.
• ☐ Local languages are present.
• ☐ The pitch opens with a real regional scenario.
15. Scope Tiers
Tier 1: Must have (the product is incomplete without these)
• Emergency panel with tap-to-call numbers.
• Safety guides for flood and landslide (before, during, after).
• District alerts and risk status.
• Shelters and hospitals by district.
• Offline-first PWA.
• Multilingual UI (English, Assamese, Hindi).
• Accessibility baseline (contrast, keyboard, large text).
• Tests, CI and README.
Tier 2: Should have
• Community report form with validation, rate limiting and moderation.
• Read-aloud for guides and alerts.
• Share-my-location message (WhatsApp, SMS or copy link).
• Emergency kit checklist that the user can tick off and keep on the device.
• Installable app prompt.
Tier 3: Could have
• Map view of shelters (Leaflet with OpenStreetMap tiles cached lightly).
• Admin page to approve reports and publish alerts.
• Family safety plan builder (saved only on the device).
• Printable one-page emergency card.
• Light and dark theme.
Tier 4: Won't build now (future work)
• IoT sensors, ML prediction, native apps, public accounts, push notifications from a server.
16. User Stories
Emergency access
• US-01: As a resident, I want to call 112 in one tap so that I can reach help fast.
• US-02: As a resident, I want to see state and district helplines so that I can reach local authorities.
• US-03: As a resident, I want the emergency panel on every screen so that I never have to search for it.
• US-04: As a resident, I want to share my location by message so that rescuers or family can find me.
Staying informed
• US-05: As a resident, I want to select my district so that I see only relevant information.
• US-06: As a resident, I want to see the current risk level and advisories so that I can decide whether to move.
• US-07: As a resident, I want to see when the information was last updated so that I can judge how reliable it is.
• US-08: As a resident, I want to see the information source so that I can trust it.
Safety guidance
• US-09: As a resident, I want clear steps for before, during and after a flood so that I act correctly.
• US-10: As a resident, I want clear steps for before, during and after a landslide so that I act correctly.
• US-11: As a resident, I want guides read aloud so that I can follow them without reading.
• US-12: As a resident, I want guides in my language so that I understand them fully.
• US-13: As a resident, I want an emergency kit checklist so that I prepare in advance.
Finding assistance
• US-14: As a resident, I want to find relief shelters in my district so that I know where to go.
• US-15: As a resident, I want to find the nearest hospitals and their contact numbers so that I can get care.
• US-16: As a resident, I want a tap-to-call button on each shelter so that I can confirm it is open.
Community reporting
• US-17: As a volunteer, I want to report a blocked road or flooded area so that others are warned.
• US-18: As a resident, I want to see approved community reports for my district so that I avoid danger.
• US-19: As a resident, I want reports to be moderated so that false alarms do not spread.
Offline and access
• US-20: As a resident, I want the app to work with no network so that it helps during outages.
• US-21: As a resident, I want a clear offline banner with the last updated time so that I know what I am seeing.
• US-22: As an elderly user, I want a large-text mode so that I can read everything.
• US-23: As a low-vision user, I want a high-contrast mode so that I can see clearly.
• US-24: As a screen-reader user, I want properly labelled controls so that I can use the app independently.
Administration (Tier 3)
• US-25: As an officer, I want to approve or reject reports so that only verified information is shown.
• US-26: As an officer, I want to publish an official alert for a district so that residents see it quickly.
17. Functional Requirements
Emergency panel
• FR-01: The emergency panel is reachable from every page in one tap (floating button and header link).
• FR-02: The panel lists 112, ambulance, police, fire and disaster helplines as tel: links.
• FR-03: The panel shows state and district control room numbers for the selected district.
• FR-04: The panel includes a share-my-location action that builds a message with a map link, using the Geolocation API only after the user taps.
• FR-05: If location is denied or unavailable, the action falls back to a message asking the user to describe the location.
District and alerts
• FR-06: The user can choose a district from a searchable list and the choice is remembered on the device.
• FR-07: Each district shows a risk level (Low, Moderate, High, Severe) with text and an icon, not colour alone.
• FR-08: Each alert shows title, message, hazard type, issued time, source and validity period.
• FR-09: Alerts are loaded from the API when online and from the cache when offline.
• FR-10: Demo or sample data is clearly labelled in the interface.
• FR-11: Expired alerts are hidden by default and viewable in a history list.
Safety guides
• FR-12: Guides exist for floods and landslides, each with Before, During and After sections.
• FR-13: Each guide step is a short sentence with an icon and can be marked as read.
• FR-14: Each guide can be read aloud with play, pause and stop controls.
• FR-15: Guides are available in English, Assamese and Hindi.
• FR-16: An emergency kit checklist can be ticked and the state is stored locally.
Shelters and hospitals
• FR-17: The user can list shelters and hospitals for the selected district.
• FR-18: Each entry shows name, address or landmark, capacity (if known), phone and last verified date.
• FR-19: Each entry has a call button and a copy-address button.
• FR-20: Optional: a map view shows entries as markers.
Community reports
• FR-21: The user can submit a report with type, district, short note and optional road or area name.
• FR-22: The note has a hard length limit and is sanitised.
• FR-23: Submissions are rate limited per client and per time window.
• FR-24: New reports have status pending and are hidden from the public.
• FR-25: Approved reports appear in the district view with the time posted.
• FR-26: If offline, a report is queued on the device and sent when the network returns.
Language and preferences
• FR-27: The user can switch between English, Assamese and Hindi from any page.
• FR-28: The chosen language, district, text size and contrast mode persist on the device.
• FR-29: Numbers, dates and times are formatted for the chosen language.
Offline and install
• FR-30: The app shell, guides, helplines, shelters and last fetched alerts are cached on first visit.
• FR-31: An offline banner appears when the network is unavailable and disappears when it returns.
• FR-32: The app is installable with a manifest and icons.
• FR-33: Updated content is fetched in the background and applied on the next load.
Admin (Tier 3)
• FR-34: An admin page is protected by a secret passcode or provider login.
• FR-35: Admins can approve, reject or delete reports.
• FR-36: Admins can create, edit and expire alerts.
18. Non-Functional Requirements
Performance
• NFR-01: Mobile Lighthouse Performance score at least 90.
• NFR-02: Main route first load JavaScript under 150 KB gzipped.
• NFR-03: LCP under 2.5 seconds, CLS under 0.1, INP under 200 ms on simulated slow 4G.
• NFR-04: Repeat visits load from cache in under 1 second.
Reliability
• NFR-05: Critical features work with no network after one successful visit.
• NFR-06: API failures show a friendly message and fall back to cached data.
• NFR-07: No unhandled promise rejections or console errors in normal use.
Security
• NFR-08: Zero high or critical findings in the dependency audit.
• NFR-09: All write endpoints validated and rate limited.
• NFR-10: No secrets in the repository or in client bundles.
Accessibility
• NFR-11: WCAG 2.2 AA conformance for all core screens.
• NFR-12: Lighthouse Accessibility score of 100 where achievable and axe with zero serious violations.
Maintainability
• NFR-13: TypeScript strict mode and zero lint errors.
• NFR-14: Test coverage above 70 percent for logic code.
• NFR-15: Each module documented in the README or in code comments where non-obvious.
Compatibility
• NFR-16: Works on the last two versions of Chrome, Firefox, Safari and Edge, and on Android Chrome with 2 GB RAM devices.
• NFR-17: Usable from 320 px width upward.
Privacy
• NFR-18: No tracking, no advertising scripts, no personal data collected by default.
19. Technology Stack and Rationale
Layer Choice Reason
Framework Next.js (App Router) with TypeScript Familiar, fast, built-in routing and API routes, easy deployment
Styling Tailwind CSS with a small design token file Small output, consistent spacing, easy theming
i18n next-intl or a light custom dictionary Small, supports Assamese and Hindi scripts
PWA Custom service worker or Serwist/next-pwa Full control over caching strategies
Database MongoDB Atlas free tier with Mongoose or the native driver Matches existing experience, flexible documents
Validation Zod One schema for client and server
Sanitising sanitize-html or DOMPurify (server) Removes markup from user notes
Rate limiting In-memory limiter with an interface that can swap to Upstash Redis Simple now, scalable later
Maps (optional) Leaflet with OpenStreetMap Free and light
Voice Web Speech API (speechSynthesis) No server cost, works offline on many devices
Testing Vitest, React Testing Library, Playwright, axe-core Fast unit tests plus real browser e2e
Lint and format ESLint, Prettier, Husky, lint-staged Enforced quality
CI GitHub Actions Runs lint, types, tests, Lighthouse CI
Hosting Vercel Free, quick HTTPS, preview URLs
Decisions to record as ADRs (architecture decision records)
• ADR-001: Use Next.js with TypeScript for type safety and API routes.
• ADR-002: Static seed data for critical content so the app never depends on the database to be useful.
• ADR-003: Cache-first for static content, stale-while-revalidate for alerts, network-first for reports.
• ADR-004: No user accounts for the public to avoid storing personal data.
• ADR-005: Moderation before publication for community reports.
• ADR-006: Dictionary-based i18n with keys stored in JSON files.
20. Architecture Overview
+---------------------------------------------------------------+
|                        User device                            |
|                                                               |
|  +-----------------+     +-----------------------------+      |
|  |  Next.js UI     |<--->|  Service Worker (cache)     |      |
|  |  (React, i18n)  |     |  app shell, guides, alerts  |      |
|  +--------+--------+     +--------------+--------------+      |
|           |                             |                     |
|  +--------v--------+            +-------v--------+            |
|  | LocalStorage /  |            | IndexedDB      |            |
|  | preferences     |            | report queue   |            |
|  +-----------------+            +----------------+            |
+-----------------------------|---------------------------------+
                              | HTTPS (when online)
+-----------------------------v---------------------------------+
|                       Next.js server                          |
|  /api/alerts   /api/districts   /api/shelters   /api/reports  |
|  validation (Zod) -> sanitising -> rate limit -> handler       |
+-----------------------------|---------------------------------+
                              |
                   +----------v-----------+
                   |  MongoDB Atlas       |
                   |  alerts, reports,    |
                   |  shelters, districts |
                   +----------------------+
Data flow summaries
• Read path: UI asks cache first, then network. Static content ships in the build and is precached.
• Alert path: service worker returns cached alerts immediately and refreshes in the background.
• Report path: form validates on the client, sends to the API, API validates again, sanitises, rate limits and stores as pending.
• Offline report path: if the network is down, the report goes to the IndexedDB queue and Background Sync or an online event retries it.
21. Folder Structure
northeast-connect/
  .github/workflows/ci.yml
  .husky/pre-commit
  docs/
    adr/001-nextjs.md
    adr/002-static-seed-data.md
    adr/003-caching-strategy.md
    adr/004-no-public-accounts.md
    adr/005-moderation.md
    architecture.md
    accessibility-report.md
    security-checklist.md
    performance-report.md
  public/
    manifest.webmanifest
    sw.js
    icons/ (192, 512, maskable)
    offline.html
  src/
    app/
      [locale]/
        layout.tsx
        page.tsx                 (home)
        alerts/page.tsx
        guides/page.tsx
        guides/[hazard]/page.tsx
        shelters/page.tsx
        report/page.tsx
        kit/page.tsx
        about/page.tsx
        admin/page.tsx           (Tier 3)
      api/
        alerts/route.ts
        districts/route.ts
        shelters/route.ts
        reports/route.ts
        admin/reports/route.ts   (Tier 3)
      manifest.ts
      globals.css
    components/
      layout/ Header.tsx, Footer.tsx, EmergencyFab.tsx, OfflineBanner.tsx
      emergency/ EmergencyPanel.tsx, CallButton.tsx, ShareLocation.tsx
      alerts/ AlertCard.tsx, RiskBadge.tsx, DistrictSelect.tsx
      guides/ GuideSteps.tsx, ReadAloud.tsx, KitChecklist.tsx
      shelters/ ShelterList.tsx, ShelterCard.tsx, ShelterMap.tsx
      reports/ ReportForm.tsx, ReportList.tsx
      settings/ LanguageSwitcher.tsx, TextSizeToggle.tsx, ContrastToggle.tsx
      ui/ Button.tsx, Card.tsx, Dialog.tsx, Toast.tsx, VisuallyHidden.tsx
    lib/
      db.ts, env.ts, rateLimit.ts, sanitize.ts, validators.ts
      time.ts, format.ts, geo.ts, speech.ts, storage.ts, offlineQueue.ts
    data/
      districts.json, helplines.json, shelters.json, alerts.sample.json
      guides/flood.en.json, flood.as.json, flood.hi.json
      guides/landslide.en.json, landslide.as.json, landslide.hi.json
    i18n/
      en.json, as.json, hi.json, config.ts
    hooks/
      useOnlineStatus.ts, usePreferences.ts, useSpeech.ts, useDistrict.ts
    types/ index.ts
  tests/
    unit/ validators.test.ts, sanitize.test.ts, rateLimit.test.ts, time.test.ts
    api/ reports.test.ts, alerts.test.ts
    components/ EmergencyPanel.test.tsx, LanguageSwitcher.test.tsx
    e2e/ main-journey.spec.ts, offline.spec.ts, a11y.spec.ts
  .env.example
  eslint.config.mjs
  prettier.config.mjs
  tsconfig.json
  vitest.config.ts
  playwright.config.ts
  lighthouserc.json
  README.md
22. Data Model
All types live in src/types/index.ts and are shared by the client, the API and the tests. Validation schemas in src/lib/validators.ts mirror them with Zod.
export type Locale = 'en' | 'as' | 'hi';

export type Hazard = 'flood' | 'landslide' | 'storm' | 'earthquake' | 'general';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface District {
  id: string;              // slug, for example 'dhemaji'
  name: Record<Locale, string>;
  state: 'Assam' | 'Arunachal Pradesh' | 'Meghalaya' | 'Manipur' | 'Mizoram' | 'Nagaland' | 'Tripura' | 'Sikkim';
  controlRoom: string;     // district emergency operations centre number
  lat?: number;
  lng?: number;
}

export interface Alert {
  id: string;
  districtId: string;
  hazard: Hazard;
  risk: RiskLevel;
  title: Record<Locale, string>;
  message: Record<Locale, string>;
  source: string;          // for example 'ASDMA advisory' or 'Demo data'
  isDemo: boolean;
  issuedAt: string;        // ISO 8601
  validUntil: string;      // ISO 8601
}

export interface Helpline {
  id: string;
  label: Record<Locale, string>;
  number: string;          // digits only, used in tel: links
  scope: 'national' | 'state' | 'district';
  districtId?: string;
  available: string;       // for example '24x7'
}

export type FacilityType = 'shelter' | 'hospital' | 'police' | 'fire';

export interface Facility {
  id: string;
  districtId: string;
  type: FacilityType;
  name: Record<Locale, string>;
  landmark: Record<Locale, string>;
  phone?: string;
  capacity?: number;
  lat?: number;
  lng?: number;
  lastVerified: string;    // ISO date
  isDemo: boolean;
}

export interface GuideStep {
  id: string;
  phase: 'before' | 'during' | 'after';
  icon: string;            // name of an inline SVG icon
  text: Record<Locale, string>;
}

export interface Guide {
  hazard: Hazard;
  title: Record<Locale, string>;
  steps: GuideStep[];
}

export type ReportType = 'road_blocked' | 'area_flooded' | 'landslide' | 'bridge_damaged' | 'need_help' | 'safe_shelter';

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface Report {
  id: string;
  districtId: string;
  type: ReportType;
  note: string;            // sanitised, max 200 characters
  place?: string;          // optional road or village name, max 80 characters
  status: ReportStatus;
  createdAt: string;
  clientHash: string;      // salted hash used only for rate limiting, never stored raw
}

export interface Preferences {
  locale: Locale;
  districtId?: string;
  textScale: 1 | 1.25 | 1.5;
  highContrast: boolean;
  reducedMotion: boolean;
  readGuides: string[];    // ids of guide steps marked as read
  kitChecked: string[];    // ids of checklist items ticked
}
Data model rules
• Multilingual fields are objects keyed by locale so a missing translation is caught by a test.
• Every piece of information shown to users carries a source and a date or an isDemo flag.
• Dates are stored in UTC ISO 8601 and formatted only at display time.
• The report document stores only a salted hash for rate limiting, never an IP address.
• Indexes: reports on (status, districtId, createdAt), alerts on (districtId, validUntil).
• Reports have a time-to-live index so old pending items expire automatically.
15. Seed Data Plan
The product must be useful even if the database and network are unavailable, so critical content is bundled as JSON.
Districts
• Seed 10 flood-prone Assam districts first: Dhemaji, Lakhimpur, Majuli, Dibrugarh, Barpeta, Morigaon, Kamrup Metropolitan, Cachar, Jorhat, Golaghat.
• Structure the file so that districts from other North East states can be added without code changes.
• Provide names in English, Assamese and Hindi.
Helplines (verify every number before the demo)
Label Number Scope
National emergency 112 National
Police 100 National
Fire 101 National
Ambulance 108 National
Disaster management helpline 1070 State control room
District emergency operations 1077 District
• Add the state disaster authority contact from its official website and note the source in the file.
• Add a field named verifiedOn so judges see the data is maintained.
Alerts
• Create 6 to 10 sample alerts across 4 districts with different risk levels and hazards.
• Every sample alert has isDemo set to true and source set to Demo data.
• Include one expired alert to prove that filtering works.
• If an official feed or page can be linked, show a link to it rather than copying content.
Facilities
• Create 3 to 5 sample shelters and 2 hospitals for each seeded district, clearly marked as sample.
• Use real, publicly listed hospital names only if you can verify them, otherwise use neutral names such as Sample Relief Camp A.
Guides (write once in English, then translate)
• Flood guide: about 8 steps in each phase.
• Landslide guide: about 8 steps in each phase.
• Keep sentences under 14 words, one action per step.
• Have a native Assamese and Hindi speaker review the translations and record the reviewer in the README.
Emergency kit checklist items
• Drinking water and water purification tablets
• Dry food that needs no cooking
• Torch with spare batteries
• Power bank, fully charged
• Portable radio
• First-aid kit and regular medicines
• Copies of identity documents in a waterproof bag
• Cash in small notes
• Whistle
• Warm clothes and a plastic sheet
• Emergency contact list on paper
• Baby, elderly or pet supplies if needed
16. Internationalisation Plan
Languages
• English (en), Assamese (as), Hindi (hi). Add Bengali (bn) and Bodo (brx) as future work.
Rules
• Locale is part of the URL path, for example /as/alerts, so pages can be linked and cached per language.
• Set the html lang attribute to the active locale.
• Load a font that supports the Assamese and Devanagari scripts, with system font fallbacks, and subset it to keep the size small.
• Do not hard-code text in components. Every visible string comes from a dictionary key.
• Avoid concatenating sentences. Use full-sentence keys with placeholders.
• Format dates and numbers using Intl APIs with the active locale.
• Layouts must survive text that is 30 percent longer than English.
Dictionary key layout (example)
common.emergency, common.call, common.share, common.offline, common.lastUpdated
home.title, home.subtitle, home.cta.guides, home.cta.alerts, home.cta.shelters
alerts.title, alerts.noAlerts, alerts.demoNotice, alerts.risk.low, alerts.risk.high
guides.title, guides.phase.before, guides.phase.during, guides.phase.after, guides.markRead
shelters.title, shelters.filter.type, shelters.call, shelters.copyAddress
report.title, report.type.road_blocked, report.note.label, report.submit, report.queued
settings.language, settings.textSize, settings.contrast, settings.readAloud
errors.network, errors.validation, errors.rateLimit, errors.generic
i18n quality checks
• A unit test fails if any key exists in English but is missing in Assamese or Hindi.
• A unit test fails if any placeholder is missing in a translation.
• A visual check at 320 px width for every language.
17. Page Specifications
17.1 Home (/[locale])
• Purpose: orient the user and give instant access to the most urgent actions.
• Layout, top to bottom:
o Header with logo, language switcher, settings menu.
o District selector card with the remembered district.
o Risk summary card for the selected district (badge, one-line message, last updated).
o Primary actions: Emergency numbers, Safety guides, Shelters nearby, Report a problem.
o Latest approved community reports (up to 3).
o Footer with sources, privacy note and about link.
• States: first visit (no district chosen), online, offline with cached data, error.
• Accessibility: one h1, landmark regions, focus moves to the main region on route change.
17.2 Emergency panel (overlay on every page, also /[locale]/emergency)
• Purpose: reach help in one tap.
• Content: 112 as the largest button, other helplines, district control room, share my location.
• Behaviour: opens as a dialog from the floating button, traps focus, closes with Escape.
• Offline: fully functional because numbers are bundled.
• Error state: if the device cannot place calls, show the number as copyable text.
17.3 Alerts (/[locale]/alerts)
• Purpose: see current alerts for the selected district.
• Controls: district select, hazard filter, show expired toggle.
• List: AlertCard with risk badge, title, message, source, issued time, valid until.
• Empty state: a calm message saying no active alerts and a link to guides.
• Demo notice banner whenever any visible alert is demo data.
• Offline: show cached alerts with a last updated time and an offline banner.
17.4 Guides index (/[locale]/guides) and guide page (/[locale]/guides/[hazard])
• Purpose: act correctly before, during and after a hazard.
• Layout: tabs or accordions for Before, During and After.
• Each step: icon, short sentence, a mark as read checkbox.
• Read-aloud control bar: play, pause, stop, and speed (normal or slow).
• Progress indicator per phase, text based as well as visual.
• Offline: guides are precached.
17.5 Shelters and hospitals (/[locale]/shelters)
• Purpose: find help nearby.
• Controls: district select, type filter (shelter, hospital), search by name.
• List: ShelterCard with name, landmark, phone, capacity, last verified.
• Actions: call, copy address, open in maps (link only, no embedded tiles by default).
• Optional: map view toggle that lazy loads Leaflet.
• Offline: list works from cache, map toggle is disabled with an explanation.
17.6 Report (/[locale]/report)
• Purpose: tell others about a ground condition.
• Form fields: type (radio group), district (select), place (text, optional), note (textarea with counter).
• Behaviour: client validation, server validation, success message explaining that reports are reviewed before publication.
• Offline: report is queued and a message confirms it will be sent when online.
• Abuse controls: honeypot field, rate limit message, length cap.
• Privacy text: do not enter names or phone numbers.
17.7 Emergency kit (/[locale]/kit)
• Purpose: prepare before a disaster.
• Content: checklist with progress, saved on the device only.
• Actions: reset list, print the page (print stylesheet with a clean one-page layout).
17.8 About and sources (/[locale]/about)
• Purpose: build trust.
• Content: what the app is, data sources, how reports are moderated, privacy statement, accessibility statement, contact, open-source licence.
17.9 Admin (/[locale]/admin, Tier 3)
• Purpose: moderate reports and publish alerts.
• Access: passcode checked on the server with a signed, httpOnly, same-site cookie.
• Views: pending reports queue with approve and reject, alerts editor with expiry.
• Not linked from the public navigation. Excluded from search with noindex.
17.10 Offline fallback (/offline.html)
• A static page shown if a navigation fails and nothing is cached, with emergency numbers included in plain HTML.
18. Component Specifications
Layout components
• Header: logo, nav links, LanguageSwitcher, settings menu. Collapses into a menu below 640 px.
• EmergencyFab: fixed bottom-right button labelled Emergency with a phone icon, 56 px minimum, high-contrast red with white text, always focusable and reachable first via a skip link.
• OfflineBanner: appears when useOnlineStatus is false, uses role=status and aria-live=polite, shows last updated time.
• Footer: sources link, privacy note, accessibility statement.
Emergency components
• CallButton: props label, number, size. Renders an anchor with tel: href, an accessible name that includes the number, and a copy fallback.
• EmergencyPanel: dialog with a list of CallButton items and ShareLocation.
• ShareLocation: on click requests location, builds a message (text plus maps link), then offers WhatsApp, SMS and Copy.
Alert components
• RiskBadge: props level. Shows icon, text label and colour. Never colour only.
• AlertCard: props alert, locale. Shows title, message, source, times, demo tag.
• DistrictSelect: accessible combobox with search, remembers selection through usePreferences.
Guide components
• GuideSteps: renders steps by phase with checkboxes and progress.
• ReadAloud: uses useSpeech, supports play, pause, stop, rate, and chooses a voice matching the locale when available. Shows a notice if no voice exists for the language.
• KitChecklist: checklist items with local persistence and progress.
Shelter components
• ShelterList: filter state, search, and virtualised rendering only if the list is large.
• ShelterCard: details with call and copy actions.
• ShelterMap: lazy loaded Leaflet map, only on demand.
Report components
• ReportForm: controlled form with Zod validation, counter, honeypot, submit state and queue support.
• ReportList: approved reports with type icon, note, time, district.
Settings components
• LanguageSwitcher: select or button group, updates route locale and preference.
• TextSizeToggle: three sizes applied through a CSS variable on the root.
• ContrastToggle: toggles a data-contrast attribute that switches design tokens.
UI primitives
• Button, Card, Dialog (focus trap, escape to close, return focus), Toast (aria-live), VisuallyHidden, Icon.
• Every primitive has a minimum 48 px touch target and a visible focus ring with at least 3 to 1 contrast.
Design tokens
• Colour: neutral background, dark text, one emergency red, one calm blue for primary actions, risk colours with text and icon support.
• Type scale: base 18 px on mobile, line height 1.5, user scale 1, 1.25 or 1.5.
• Spacing: 4 px grid.
• Radius: 12 px for cards, 9999 px for pills.
• Motion: transitions under 200 ms and disabled when reduced motion is on.
19. API Specification
All routes live under /api, return JSON, use consistent error bodies and set cache headers explicitly.
Error format
{ error: { code: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'NOT_FOUND' | 'SERVER_ERROR' | 'UNAUTHORIZED', message: string, details?: object } }
GET /api/districts
• Returns the list of districts with localised names.
• Cache: public, max-age 86400, stale-while-revalidate.
• Fallback: the same data is bundled with the app.
GET /api/alerts?districtId=&hazard=&includeExpired=
• Validates query parameters with Zod.
• Returns alerts sorted by risk then issue time.
• Includes fetchedAt in the response body so the client can show last updated.
• Cache: public, max-age 60, stale-while-revalidate 600.
• Errors: 400 for invalid input, 500 with a generic message.
GET /api/shelters?districtId=&type=
• Returns facilities for a district with optional type filter.
• Cache: public, max-age 3600, stale-while-revalidate.
GET /api/reports?districtId=
• Returns only approved reports for the district, newest first, limited to 20.
• Cache: public, max-age 30.
POST /api/reports
• Body: districtId, type, note, place, honeypot.
• Pipeline: size limit, content type check, parse JSON, Zod validation, honeypot check, sanitise, rate limit, store as pending.
• Rate limit: 5 reports per client per hour and 20 per hour per district.
• Success: 201 with a minimal body (id and status).
• Errors: 400 validation, 413 payload too large, 429 rate limited with Retry-After, 500 generic.
• Never echoes raw input back unsanitised.
Admin routes (Tier 3)
• POST /api/admin/login: verifies the passcode with a constant-time compare, sets a signed httpOnly cookie, rate limited strictly.
• GET /api/admin/reports?status=pending: lists reports for moderation.
• PATCH /api/admin/reports/:id: body status approved or rejected.
• POST /api/admin/alerts and PATCH /api/admin/alerts/:id: manage alerts.
• All admin routes check the cookie and respond 401 otherwise.
Handler pattern
export async function POST(req: Request) {
  const limited = await checkRateLimit(req, 'reports:create');
  if (limited) return errorResponse(429, 'RATE_LIMITED', 'Too many reports. Please try later.');

  const body = await safeJson(req, { maxBytes: 2048 });
  const parsed = reportInputSchema.safeParse(body);
  if (!parsed.success) return errorResponse(400, 'VALIDATION_ERROR', 'Invalid input', parsed.error.flatten());
  if (parsed.data.honeypot) return okResponse({ ok: true });   // silently ignore bots

  const clean = sanitiseReport(parsed.data);
  const created = await createPendingReport(clean, hashClient(req));
  return okResponse({ id: created.id, status: 'pending' }, 201);
}
20. State and Preference Management
• Server data is fetched with a small wrapper around fetch that supports caching, timeouts and cache fallback.
• Preferences live in a single object stored in localStorage under one key, with a version number for future migration.
• usePreferences wraps reads and writes, falls back to defaults if storage is blocked or corrupt, and never throws.
• Language is derived from the URL first, then stored preference, then browser language, then English.
• Text scale and contrast are applied to the root element so every component inherits them.
• The offline report queue uses IndexedDB through a tiny helper, with a maximum of 10 queued items and a clear message if full.
• useOnlineStatus listens to online and offline events and also verifies with a lightweight request, because the browser flag can be wrong.
• No global state library is required. React context for preferences and local state elsewhere keeps the bundle small.
21. Offline-First and PWA Plan
21.1 Goals
• After one successful visit, the emergency panel, guides, helplines, shelters and last alerts work with no network.
• The user always knows whether they are seeing live or saved data.
• Updates reach the user without breaking an open session.
21.2 Web app manifest fields
• name: Northeast Connect, short_name: NE Connect.
• start_url: /en/ (the locale redirect handles the rest), scope: /.
• display: standalone, orientation: portrait-primary.
• theme_color and background_color matching the design tokens.
• icons: 192, 512 and a maskable 512 PNG.
• lang: en, dir: ltr.
• shortcuts: Emergency numbers, Safety guides, Shelters (each opens the right route).
• description written in plain language.
21.3 Caching strategies by resource
Resource Strategy Reason
App shell (HTML, JS, CSS, fonts) Precache at install, versioned Instant load and offline use
Guides, helplines, districts JSON Cache first, update in background Rarely change, must be available
GET /api/alerts Stale while revalidate with timestamp Show something instantly, refresh quietly
GET /api/shelters Stale while revalidate Same reason
GET /api/reports Network first, fall back to cache Freshness matters more
POST /api/reports Network only, queue on failure Writes must not be cached
Images Cache first with size limit Save bandwidth
Navigations Network first with offline.html fallback Always show something helpful
21.4 Service worker outline
const VERSION = 'v1';
const SHELL = 'shell-' + VERSION;
const DATA = 'data-' + VERSION;
const PRECACHE = ['/offline.html', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/alerts') || url.pathname.startsWith('/api/shelters')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(request).then((r) => r || caches.match('/offline.html'))));
    return;
  }
  event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DATA);
  const cached = await cache.match(request);
  const network = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);
  return cached || network;
}
21.5 Offline user experience
• OfflineBanner text: You are offline. Showing saved information from <date and time>.
• Buttons that need the network (submit report, refresh) change to a queued state instead of failing.
• Emergency numbers never depend on the network.
• The offline fallback page lists 112 and the main helplines in plain HTML.
21.6 Offline report queue
• If POST fails because the network is down, store the validated payload in IndexedDB with a timestamp.
• Show a confirmation: Saved on your phone. It will be sent when you are online.
• On the online event, send queued reports one at a time, delete each on success, keep on failure.
• Cap the queue at 10 items and drop the oldest with a message if exceeded.
• Server still validates and rate limits queued reports, so the queue cannot be used to bypass limits.
21.7 Update flow
• New service worker installs in the background.
• When ready, show a small toast: A new version is available. Refresh.
• Never force a reload during a form entry.
21.8 Offline test plan
• Load the app online, go to the Network tab, set Offline, reload each route and confirm it renders.
• Use Playwright to emulate offline mode and assert the banner, guides and emergency numbers.
• Test first visit offline to confirm the offline fallback appears.
• Test the report queue by submitting offline, going online and confirming delivery.
22. Performance Plan
22.1 Budgets
Metric Target
Lighthouse Performance (mobile) 90 or more
Main route JavaScript (gzip) under 150 KB
Total page weight on first load under 500 KB
LCP under 2.5 s on slow 4G
CLS under 0.1
INP under 200 ms
Time to interactive, repeat visit under 1 s
22.2 Techniques
• Prefer server components and static generation for pages that do not need client state.
• Mark only interactive components as client components.
• Lazy load the map, the admin page and the read-aloud controls.
• Avoid heavy libraries. Use native fetch, Intl and the Web Speech API.
• Use SVG icons inline or as a sprite, not an icon font.
• Use next/image or pre-sized, compressed AVIF or WebP images. Provide width and height to prevent layout shift.
• Subset fonts, use font-display swap, and preload only the primary font.
• Use system fonts as a fallback for Assamese and Devanagari.
• Enable compression and long-lived cache headers for static assets.
• Remove unused CSS through Tailwind purge.
• Avoid layout thrash and large synchronous work on the main thread.
• Debounce district search input.
22.3 Measurement
• Run Lighthouse CI in the pipeline with a performance budget file.
• Run bundle analysis and record the sizes in docs/performance-report.md.
• Test on a throttled profile (slow 4G, 4x CPU slowdown) and record the results.
• Include before and after numbers in the README.
22.4 Efficiency of resource use
• Cache API responses so repeat visits avoid network requests.
• Use conditional requests with ETag or Last-Modified for data endpoints.
• Keep database queries indexed and limited, with pagination.
• Avoid polling. Refresh alerts on page focus and on a long interval only.
• Keep animations CSS-only and disable them for reduced motion.
23. Accessibility Plan (WCAG 2.2 AA)
23.1 Principles applied
• Perceivable: text alternatives, contrast, resizable text, no colour-only meaning.
• Operable: keyboard access, large targets, no time limits, no flashing.
• Understandable: plain language, consistent navigation, clear errors.
• Robust: valid semantic HTML, ARIA only when needed, tested with real assistive tools.
23.2 Implementation checklist
Structure and semantics
• ☐ One h1 per page, headings in logical order.
• ☐ Landmarks: header, nav, main, footer, and complementary where needed.
• ☐ Skip to main content link as the first focusable element.
• ☐ Lists use real ul and ol elements.
• ☐ Tables, if any, have headers and captions.
• ☐ Page titles are unique and describe the page in the active language.
• ☐ lang attribute set on html, and on inline text in another language.
Keyboard and focus
• ☐ Every interactive element is reachable and operable by keyboard.
• ☐ Visible focus ring with at least 3 to 1 contrast against adjacent colours.
• ☐ Dialogs trap focus, close with Escape and return focus to the trigger.
• ☐ Focus moves to the page heading after route change.
• ☐ No keyboard traps, and tab order matches reading order.
Visual design
• ☐ Text contrast at least 4.5 to 1, large text and icons at least 3 to 1.
• ☐ Risk level shown by text and icon, not colour only.
• ☐ Touch targets at least 48 by 48 CSS pixels with spacing.
• ☐ Layout reflows at 320 px width with no horizontal scrolling.
• ☐ Text can be resized to 200 percent without loss of content.
• ☐ Large-text toggle and high-contrast mode.
• ☐ Reduced motion honoured through prefers-reduced-motion.
• ☐ Dark mode checked for contrast if provided.
Forms
• ☐ Every input has a visible label connected with for and id.
• ☐ Required fields marked in text, not only with a colour or star.
• ☐ Errors shown in text next to the field and summarised at the top, with aria-describedby.
• ☐ Error messages explain how to fix the problem.
• ☐ Character counter announced politely and not on every keystroke.
• ☐ Autocomplete attributes set where relevant.
• ☐ Success messages use role=status.
Dynamic content
• ☐ Offline banner and toasts use role=status or aria-live polite.
• ☐ Urgent alerts use role=alert sparingly.
• ☐ Loading states announced and not infinite.
• ☐ Read-aloud controls have clear labels and state (Play, Pause, Stop).
Content
• ☐ Plain language, short sentences, reading level suitable for a general audience.
• ☐ Icons have text labels or are marked decorative with aria-hidden.
• ☐ Images have meaningful alt text or empty alt if decorative.
• ☐ Links describe their destination, no click here.
• ☐ Phone numbers announced as numbers, with accessible names such as Call emergency 112.
Language and inclusion
• ☐ Assamese and Hindi fonts render correctly and are readable at small sizes.
• ☐ Voice read-aloud available for guides and alerts.
• ☐ Guides written so they make sense when read aloud.
• ☐ A note appears if the device has no voice for the chosen language.
23.3 Testing the accessibility work
• Automated: axe-core in unit tests and Playwright, Lighthouse accessibility audit.
• Manual keyboard pass on every page without a mouse.
• Screen reader pass with NVDA on Windows or TalkBack on Android for the main journey.
• Zoom and text scaling pass at 200 percent and 400 percent.
• Colour contrast check on every token pair, recorded in a table.
• High contrast and forced-colours mode check.
• Write results in docs/accessibility-report.md and include an Accessibility Statement page.
23.4 Contrast table to fill in
Foreground Background Ratio Pass
Body text Page background measure needs 4.5
Emergency button text Emergency red measure needs 4.5
Primary button text Primary blue measure needs 4.5
Risk badge text (each level) Badge colour measure needs 4.5
Focus ring Adjacent background measure needs 3
Placeholder text Input background measure needs 4.5
24. Security Plan
24.1 Threat model
Threat Example Mitigation
Spam or flooding of reports Bot posts thousands of fake reports Rate limiting, honeypot, moderation, length limits, time-to-live
False alarms or misinformation Someone posts a fake dam breach Moderation before publication, clear source labels, report type restrictions
Cross-site scripting Note contains script tags Server sanitising, React escaping, strict CSP, no dangerouslySetInnerHTML
Injection Query operators in input Schema validation, typed queries, no string-built queries
Information leakage Stack traces or secrets exposed Generic errors, env-based secrets, no logging of personal data
Admin takeover Brute-force passcode Strict rate limit, constant-time compare, lockout delay, httpOnly signed cookie
Dependency risk Vulnerable package npm audit in CI, minimal dependencies, lockfile
Privacy exposure Storing location or IP Do not store, hash for rate limit only, location shared by user action
Clickjacking App embedded in a hostile frame frame-ancestors none in CSP
Man in the middle Tampered traffic HTTPS only, HSTS
24.2 Input validation and sanitising
• Use Zod schemas on the server for every query, body and path parameter.
• Enforce maximum body size before parsing.
• Allow-list enumerations (type, districtId) rather than accepting free text.
• Trim, normalise whitespace and strip control characters from text.
• Strip all HTML from notes and places. Reports are plain text only.
• Reject notes containing phone numbers or email patterns to protect privacy, with a friendly message.
• Escape on output by default through React and never inject raw HTML.
24.3 Rate limiting design
• Key: salted hash of IP plus user agent, never stored in raw form.
• Limits: 5 reports per hour per client, 20 per hour per district, 10 admin login attempts per hour per client.
• Return 429 with a Retry-After header and a friendly message.
• Interface: a RateLimiter with check(key, limit, windowMs). Start with an in-memory implementation and note that production would use a shared store.
24.4 Security headers
• Content-Security-Policy: default-src self, script-src self (nonce if inline needed), style-src self, img-src self data, connect-src self, frame-ancestors none, base-uri self, form-action self.
• Strict-Transport-Security with a long max-age and includeSubDomains.
• X-Content-Type-Options: nosniff.
• Referrer-Policy: strict-origin-when-cross-origin.
• Permissions-Policy: geolocation self, camera none, microphone none, payment none.
• Cross-Origin-Opener-Policy: same-origin.
24.4a Example header configuration
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
];
24.5 Secrets and configuration
• All secrets in environment variables, validated at startup with a Zod env schema that fails fast.
• Provide .env.example with names only.
• Never prefix a secret with NEXT_PUBLIC.
• Add secret scanning (gitleaks or GitHub secret scanning) to CI.
• Use separate values for development and production.
24.6 Admin security (Tier 3)
• Passcode stored as a hash, compared in constant time.
• Session cookie: httpOnly, secure, sameSite strict, short expiry, signed.
• CSRF protection by same-site cookies plus an origin check on state-changing requests.
• All admin actions logged with time and action, without personal data.
• Admin routes noindex and absent from the sitemap.
24.7 Dependency and build security
• Pin versions through the lockfile and review new packages before adding them.
• Run npm audit in CI and fail on high or critical findings.
• Enable Dependabot for updates.
• Avoid packages that are unmaintained or tiny single-purpose dependencies where native code works.
24.8 Security checklist (copy into docs/security-checklist.md)
• ☐ Every API input validated by a schema.
• ☐ Every write endpoint rate limited.
• ☐ Notes and places sanitised and length limited.
• ☐ Reports require moderation before display.
• ☐ Honeypot field present on the report form.
• ☐ CSP and other headers verified with a scanner.
• ☐ HTTPS enforced.
• ☐ No secrets in git history or client bundles.
• ☐ Dependency audit clean.
• ☐ Generic error messages in production.
• ☐ No raw IP, no names, no phone numbers stored.
• ☐ Admin routes protected and not indexed.
• ☐ Security tests exist for validation, sanitising and rate limiting.
25. Privacy and Trust
• Collect no accounts, names, emails or phone numbers.
• Location is used only when the user taps share my location, and it is used only to build the message on their device.
• Preferences and checklists stay in the browser.
• Report text is public after approval, so warn users not to write personal details.
• No analytics or advertising scripts. If metrics are needed, use a privacy-friendly counter with no identifiers.
• Show a short privacy statement in plain language in three languages.
• Show source and date on information so users can judge reliability.
• State clearly that the app complements official channels and that 112 is the primary emergency number.
• Add a disclaimer on demo data in every place it appears.
26. Testing Plan
26.1 Test pyramid
• Many fast unit tests for pure logic.
• A moderate number of API and component tests.
• A small number of end-to-end tests that cover the real user journeys.
• Automated accessibility checks on every key page.
26.2 Unit tests (Vitest)
validators.test.ts
• ☐ Accepts a valid report.
• ☐ Rejects an unknown report type.
• ☐ Rejects an unknown districtId.
• ☐ Rejects an empty note.
• ☐ Rejects a note over 200 characters.
• ☐ Trims whitespace and collapses repeated spaces.
• ☐ Rejects a note that contains a phone number pattern.
• ☐ Rejects a note that contains an email pattern.
• ☐ Rejects non-string values for text fields.
sanitize.test.ts
• ☐ Removes script tags and their content.
• ☐ Removes HTML tags but keeps plain text.
• ☐ Strips control characters.
• ☐ Leaves Assamese and Hindi text unchanged.
• ☐ Handles an empty string.
rateLimit.test.ts
• ☐ Allows requests up to the limit.
• ☐ Blocks the next request after the limit.
• ☐ Resets after the window passes (use fake timers).
• ☐ Keeps separate counters for separate keys.
• ☐ Returns a retry-after value.
alerts logic tests
• ☐ Filters alerts by district.
• ☐ Filters alerts by hazard.
• ☐ Hides expired alerts by default.
• ☐ Includes expired alerts when requested.
• ☐ Sorts by risk level then by issue time.
• ☐ Handles an empty list.
time and format tests
• ☐ Formats dates for English, Assamese and Hindi.
• ☐ Produces a readable relative time such as 5 minutes ago.
• ☐ Handles invalid dates without throwing.
i18n tests
• ☐ Every English key exists in Assamese and Hindi.
• ☐ No translation is an empty string.
• ☐ Placeholders match across languages.
• ☐ Every guide step has all three languages.
geo and share tests
• ☐ Builds a maps link from coordinates.
• ☐ Builds an encoded WhatsApp link.
• ☐ Falls back correctly when coordinates are missing.
26.3 API tests
• ☐ GET /api/alerts returns 200 and a list for a valid district.
• ☐ GET /api/alerts returns 400 for an invalid district.
• ☐ GET /api/reports returns only approved items.
• ☐ POST /api/reports returns 201 for a valid payload.
• ☐ POST /api/reports returns 400 with details for an invalid payload.
• ☐ POST /api/reports returns 413 for an oversized body.
• ☐ POST /api/reports returns 429 after the limit is exceeded.
• ☐ POST /api/reports with the honeypot filled returns success but stores nothing.
• ☐ Stored reports have status pending and sanitised text.
• ☐ Admin routes return 401 without a valid cookie.
• ☐ Error responses never include a stack trace.
26.4 Component tests (React Testing Library)
• ☐ EmergencyPanel renders 112 with a tel link.
• ☐ EmergencyPanel traps focus and closes with Escape.
• ☐ CallButton has an accessible name that includes the number.
• ☐ LanguageSwitcher changes the visible text and html lang.
• ☐ RiskBadge shows text as well as colour for each level.
• ☐ ReportForm shows field errors and does not submit invalid data.
• ☐ ReportForm shows the character counter.
• ☐ ReadAloud shows a notice when speech synthesis is unavailable.
• ☐ OfflineBanner appears when the online status becomes false.
• ☐ KitChecklist saves and restores ticked items.
26.5 End-to-end tests (Playwright)
main-journey.spec.ts

1. Open the home page and see the district prompt.
2. Select a district and see its risk card.
3. Open Alerts and see at least one alert.
4. Open the emergency panel and see 112.
5. Open a guide and mark a step as read.
6. Open Shelters and see a list for the district.
7. Submit a valid report and see the confirmation that it will be reviewed.
offline.spec.ts
8. Visit the home page and wait for the service worker to be ready.
9. Switch the browser context to offline.
10. Reload and confirm the page renders and the offline banner is visible.
11. Confirm the emergency numbers and a guide are still available.
12. Submit a report offline and confirm it is queued.
13. Go back online and confirm the queue is sent.
a11y.spec.ts
14. For each main route in each language, run axe.
15. Fail on any serious or critical violation.
16. Check keyboard navigation reaches the emergency button within a few tab presses.
language.spec.ts
17. Switch to Assamese, then Hindi, and confirm headings change.
18. Reload and confirm the language persists.
26.6 Non-functional tests
• Lighthouse CI on the home, alerts and guides pages with performance and accessibility thresholds.
• Bundle size check that fails if the main route exceeds the budget.
• Dependency audit step.
• Manual device check on a real low-end Android phone if available.
26.7 Coverage and reporting
• Generate a coverage report and aim for at least 70 percent on logic code.
• Publish the percentage and a screenshot in the README.
• Keep tests deterministic, with no real network calls and with fake timers where time matters.
26.8 Continuous integration (GitHub Actions)
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage
      - run: npm audit --audit-level=high
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - run: npx lhci autorun
26.9 npm scripts
• dev, build, start
• lint, lint:fix, format, typecheck
• test, test:watch, test:coverage, test:e2e
• audit, lhci
19. Code Quality Standards
27.1 Conventions
• TypeScript strict mode, no any without a comment explaining why.
• Functional components and hooks, no class components.
• One component per file, named exports for components, default exports only where Next.js requires.
• File names: PascalCase for components, camelCase for utilities, kebab-case for routes.
• Constants in UPPER_SNAKE_CASE, types in PascalCase.
• Keep functions small and single-purpose, ideally under 40 lines.
• Keep business logic out of components by placing it in lib and hooks.
• No magic numbers or strings. Use named constants and enums.
• No dead code, commented-out code or unused dependencies.
• Comments explain why, not what.
27.2 Tooling
• ESLint with typescript-eslint, react-hooks, jsx-a11y and import rules.
• Prettier with a shared config.
• Husky pre-commit running lint-staged for format and lint, and pre-push running typecheck and tests.
• EditorConfig for consistent whitespace.
• Conventional commits, such as feat, fix, docs, test, refactor, chore.
27.3 Error handling
• Central errorResponse helper for API routes.
• Never swallow errors silently. Log with context, but without personal data.
• User-facing messages are translated, calm and actionable.
• React error boundary around each route segment with a friendly fallback and the emergency numbers visible.
27.4 Documentation
• README with overview, screenshots, setup, scripts, architecture, decisions, scores and limitations.
• ADRs in docs/adr for key decisions.
• JSDoc on exported utilities.
• A CONTRIBUTING note and a LICENSE file.
27.5 Code quality checklist
• ☐ No TypeScript errors.
• ☐ No ESLint errors or warnings.
• ☐ Formatted by Prettier.
• ☐ No duplicated logic across components.
• ☐ Components under about 150 lines, pages under about 200.
• ☐ Consistent naming and folder layout.
• ☐ Environment variables documented.
• ☐ No console.log left in production code.
• ☐ Accessible by default in the shared UI primitives.
20. Build Sequence (Ordered Steps, No Time Estimates)
Step 1: Foundation
21. Create the repository and the Next.js TypeScript project.
22. Add Tailwind, ESLint, Prettier, Husky, lint-staged, Vitest and Playwright.
23. Create the folder structure from section 13.
24. Add the CI workflow and make it pass with a trivial test.
25. Write the README skeleton and the first ADRs.
26. Define design tokens and the base layout with skip link, header, footer and landmarks.
Step 2: Data and types
27. Write the shared types.
28. Create the districts, helplines, facilities, alerts and guides JSON files in English.
29. Add Assamese and Hindi translations for the interface and the guides.
30. Write the i18n completeness tests.
31. Build typed data access helpers in lib.
Step 3: Internationalisation and preferences
32. Set up locale routing and the dictionary loader.
33. Build LanguageSwitcher.
34. Build usePreferences with safe storage handling.
35. Build TextSizeToggle and ContrastToggle and wire them to design tokens.
36. Test persistence across reloads.
Step 4: Emergency features
37. Build CallButton and EmergencyPanel.
38. Build EmergencyFab and place it in the root layout.
39. Build ShareLocation with the fallbacks.
40. Write component tests and an accessibility check for the panel.
Step 5: Alerts and districts
41. Build DistrictSelect and the district preference.
42. Build RiskBadge and AlertCard.
43. Build the alerts page with filters and the demo notice.
44. Build the GET /api/alerts route with validation and cache headers.
45. Write unit and API tests for filtering and sorting.
Step 6: Guides
46. Build GuideSteps with phases and progress.
47. Build the guide pages for flood and landslide.
48. Build ReadAloud and useSpeech with the no-voice fallback.
49. Build the emergency kit page and checklist.
50. Add print styles.
Step 7: Shelters and hospitals
51. Build the facility list, search and type filter.
52. Build ShelterCard with call and copy actions.
53. Build GET /api/shelters.
54. Optionally add the lazy loaded map.
Step 8: Offline and PWA
55. Add the manifest and icons.
56. Write the service worker and register it.
57. Build useOnlineStatus and OfflineBanner.
58. Create offline.html with the emergency numbers.
59. Run the offline test plan and fix gaps.
60. Add the update toast.
Step 9: Community reports
61. Write the Zod schema, sanitiser and rate limiter with unit tests first.
62. Build POST and GET /api/reports.
63. Build ReportForm with validation, honeypot and the offline queue.
64. Build ReportList and show approved reports in the district view.
65. Add API tests for success, validation errors, size limit and rate limit.
Step 10: Security hardening
66. Add security headers and verify them with a scanner.
67. Validate environment variables at startup.
68. Run the dependency audit and fix issues.
69. Review every endpoint against the security checklist.
70. Write docs/security-checklist.md with the results.
Step 11: Accessibility pass
71. Run axe and Lighthouse accessibility on every page in each language.
72. Complete the keyboard-only walkthrough.
73. Complete a screen reader walkthrough of the main journey.
74. Fill in the contrast table and fix failures.
75. Test at 320 px, 200 percent zoom and large-text mode.
76. Write the accessibility statement and docs/accessibility-report.md.
Step 12: Performance pass
77. Run bundle analysis and remove or lazy load heavy code.
78. Optimise images and fonts.
79. Run Lighthouse on a throttled profile and fix issues.
80. Record before and after numbers in docs/performance-report.md.
81. Add Lighthouse CI budgets to the pipeline.
Step 13: Admin (optional)
82. Build the passcode login with signed cookie and strict rate limit.
83. Build the moderation queue and alerts editor.
84. Add tests for authorisation and the approval flow.
Step 14: Finish
85. Run the full test suite and the end-to-end journeys.
86. Deploy to Vercel and test the live URL on a phone.
87. Complete the README with screenshots, scores and the mapping to the six parameters.
88. Record a backup demo video.
89. Tag a release.
90. Demo and Pitch Plan
29.1 Story to open with
• Start with a short scenario: a village in Assam, the river rising at night, mobile data gone, and a family unsure where the nearest relief camp is.
• State the problem in one sentence and the solution in one sentence.
29.2 Demo script (about 4 minutes)
91. Home screen: pick a district and show the risk summary.
92. Emergency panel: show 112 and the district control room, tap share my location.
93. Alerts: show filters, sources, last updated and the demo data label.
94. Guides: open the flood guide, switch to Assamese, press read aloud.
95. Shelters: find a relief camp, show call and copy address.
96. Switch the device to airplane mode and reload. Show the app still works with the offline banner.
97. Submit a report offline and show it queued, then reconnect and show it delivered for moderation.
98. Show large-text and high-contrast modes.
99. Show the test results, Lighthouse scores and the CI badge.
29.3 Slide outline (if slides are needed)
100. Title and one-line value.
101. The problem and who is affected.
102. Our approach and design principles.
103. Live demo.
104. Architecture in one diagram.
105. How we meet each judging parameter (the six-row table).
106. Impact and what is next.
29.4 Likely judge questions and prepared answers
Question Prepared answer
Where does the alert data come from? Currently labelled sample data. The design accepts an official feed through one adapter, and we link to official sources.
How do you stop fake reports? Rate limits, honeypot, length limits and moderation before anything is public.
What if there is no internet at all? Core features are precached and work offline, and reports queue until the network returns.
How is it accessible to low-literacy users? Local languages, voice read-aloud, icons with text, large targets and large-text mode.
How do you protect privacy? No accounts, no personal data stored, location used only on tap, no tracking.
How would it scale? Static content on a CDN, cached APIs, a shared rate limiter and a managed database.
How is it different from existing apps? Offline-first, local languages, community reports with moderation, and designed for low-end phones.
What did you test? Unit, API, component, end-to-end, offline and accessibility tests running in CI.
107. README Template

# Northeast Connect

Offline-first community emergency assistant for floods and landslides in North East India.

Badges: CI, coverage, Lighthouse scores

## Problem

Short statement of the problem and who is affected.

## Solution

One paragraph and a screenshot or short video.

## Features

List by tier, with notes on what is demo data.

## How it meets the judging parameters

Table of the six parameters with links to evidence.

## Architecture

Diagram, caching strategy, data flow.

## Getting started

Prerequisites, install, environment variables, run, test, build.

## Project structure

Short tree with descriptions.

## Testing

How to run each test type, coverage number, CI link.

## Security

Summary of controls and link to the checklist.

## Accessibility

Summary, tools used, link to the report and the statement.

## Performance

Before and after numbers, budgets and how to reproduce.

## Languages and translations

Supported languages and who reviewed them.

## Data sources and limitations

What is real, what is sample, and known gaps.

## Roadmap

Sensor integration, SMS alerts, more languages, official feed adapter.

## Licence and credits
 1. Risk Register
Risk Likelihood Impact Mitigation
No official alert API available High Medium Use clearly labelled sample data, design an adapter, link to official sources
Translation errors in Assamese or Hindi Medium High Native speaker review, keep sentences short, record reviewers
Speech voices missing for Assamese High Medium Detect availability, show a notice, fall back to Hindi or text only
Service worker caches stale or broken files Medium High Versioned caches, activation cleanup, test updates
Offline queue bypasses validation Low High Server validates and rate limits again
Scope too large Medium High Respect the tiers and finish each tier with tests before the next
Demo fails on venue network Medium High Offline demo is the plan, plus a recorded backup video
Database outage Low Medium Critical data bundled in the app, graceful degradation
Wrong phone numbers shown Medium High Verify against official sources and show a verified date
Location permission denied High Low Fallback message asking for a description
Rate limiter memory reset in serverless Medium Low Document it and note a shared store for production
Colour contrast regressions Medium Medium Automated contrast checks and axe in CI
 2. Future Work (for the pitch)
• Official data adapters for state and central flood and landslide advisories.
• SMS and USSD alerts for users without smartphones or data.
• Push notifications for subscribed districts.
• IoT water-level and rain sensor ingestion and early warning models.
• More languages: Bengali, Bodo, Karbi, Mizo, Meiteilon and others.
• Volunteer and NGO coordination view for relief supply and rescue requests.
• Verified reporter roles for trusted community members.
• Offline map tiles for shelter routes.
• Integration with district control rooms for moderation workflows.
• Open data export for researchers and authorities.
 3. Final Submission Checklist
Product
• ☐ Emergency panel works on every page and offline.
• ☐ Alerts, guides, shelters and reports work as specified.
• ☐ Three languages are present and reviewed.
• ☐ Offline banner, caching and report queue behave correctly.
• ☐ Demo data is labelled everywhere.
Code Quality
• ☐ Strict types, zero lint errors, formatted code.
• ☐ README, ADRs and docs complete.
• ☐ Clean commit history.
Security
• ☐ Security checklist complete and linked.
• ☐ Headers verified, audit clean, no secrets in git.
Efficiency
• ☐ Lighthouse Performance 90 or more and budgets met.
• ☐ Performance report with numbers.
Testing
• ☐ Unit, API, component, end-to-end and accessibility tests pass in CI.
• ☐ Coverage percentage published.
Accessibility
• ☐ axe and Lighthouse clean, manual keyboard and screen reader passes done.
• ☐ Contrast table filled in and accessibility statement published.
Problem Statement Alignment
• ☐ Pitch opens with the North East flood and landslide scenario.
• ☐ Offline demo rehearsed with a backup video.
• ☐ Mapping table of the six parameters ready.
Delivery
• ☐ Live URL works on a phone.
• ☐ Repository public or shared as required.
• ☐ Release tagged and submission form completed.
