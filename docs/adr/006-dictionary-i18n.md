# ADR 006: Dictionary-Based Internationalization (i18n)

## Status

Accepted

## Context

Xahay serves diverse populations across Assam and the wider North East India, where users predominantly communicate in Assamese (অসমীয়া), Hindi (हिन्दी), or English. During floods, landslides, and infrastructure collapse:

1. **2G Network Constraints**: Third-party heavy internationalization runtimes (e.g., dynamic formatters, external localization SDKs) add significant client-side JavaScript bundle weight, slowing down time-to-interactive on low-end smartphones.
2. **Offline Resilience**: When disconnected from the internet, the application must be able to switch between English, Assamese, and Hindi instantaneously with zero network round-trips.
3. **Emergency Clarity**: Disaster response instructions require short, unambiguous, strictly bounded phrasing ($\le$ 14 words per step) and zero missing translation keys that could cause runtime crashes or missing warnings.

## Decision

We adopt a **Static Dictionary-Based Internationalization Architecture**:

1. **Direct JSON Translation Dictionaries**:
   - Centralized locale dictionaries are stored directly in `src/i18n/en.json`, `src/i18n/as.json`, and `src/i18n/hi.json`.
   - Emergency guide procedures are structured in parallel JSON catalogs (`src/data/guides/*.{en,as,hi}.json`).
2. **Type-Safe Key Definitions**:
   - `src/i18n/config.ts` exports typed helper `t(locale, key, params)` ensuring compile-time safety and automatic fallback to English if an individual key is omitted.
3. **Locale-Aware URL Routing**:
   - Next.js App Router dynamic segment `[locale]` (`en`, `as`, `hi`) delivers localized server-rendered markup directly in the initial HTML document.
4. **Client-Side Preference Persistence**:
   - The user's active locale is stored in `localStorage` via `PreferencesContext` and synchronized with URL transitions without full-page reloads.
5. **Continuous Key-Parity & Placeholder CI Verification**:
   - Automated unit tests (`tests/unit/i18n.test.ts`) assert 100% key parity across `as.json` and `hi.json` matching `en.json`.
   - Dynamic placeholders (`{time}`, `{source}`, `{count}`, `{date}`) are verified to exist identically in all language definitions.
   - Emergency guide steps are enforced to strictly stay within $\le$ 14 words per step.

## Consequences

### Positive

- **Near-Zero Bundle Overhead**: Eliminates external i18n runtime dependencies; dictionary lookups are direct object index operations running in $O(1)$ time.
- **Instant Offline Language Switching**: Translations are packaged with the application shell and precached by the Service Worker, allowing instant switching between English, Assamese, and Hindi in airplane mode.
- **Zero Runtime Crash Risk**: Guaranteed fallback to English (`en`) ensures the app never crashes or displays blank text if a string is missing.
- **Rigorous Verification**: Automated CI tests fail any build if a translation key or interpolation parameter is omitted.

### Trade-offs & Mitigations

- **Pluralization & Complex Inflections**: Complex grammatical inflections are not handled by simple key lookups.
  - _Mitigation_: Public emergency advisories prioritize concise, imperative phrasing where complex linguistic pluralizations are intentionally avoided for cognitive clarity under stress.
- **Initial Machine Draft Verification**: Non-English strings initially start as structured machine translations.
  - _Mitigation_: A clear review roster is maintained in `docs/translation-review.md`, with community and authority validation processes outlined for native speakers.
