# ADR 004: No Public User Accounts for Data Minimization and Emergency UX

## Status

Accepted

## Context

During monsoon floods, landslides, and natural disasters, individuals seeking emergency help, shelter locations, or road status updates are under severe physical and mental distress. Requiring user registration, email verification, passwords, or OAuth sign-in introduces severe friction:

1. **Critical Latency**: Delays immediate access to 112, emergency survival guides, and shelter directions.
2. **Connectivity Fragility**: Multi-step registration flows fail when cellular connectivity is unstable or operating at 2G speeds.
3. **Privacy and Data Liability**: Collecting personally identifiable information (PII) such as full names, phone numbers, home addresses, or passwords creates an unnecessary attack surface, credential theft risk, and privacy liability under Indian data protection regulations (DPDP Act).

## Decision

Xahay enforces a strict **Zero Public Accounts** policy:

- **No User Profiles or Accounts**: The public application contains no registration, login, or personal profile pages.
- **Client-Side Preference Storage**: User preferences (selected district, preferred language, contrast mode, text size, and survival kit checklist state) are stored strictly within the user's browser via `localStorage`.
- **Anonymous Community Submissions**: Ground condition reports (e.g. "Road blocked by landslide at mile 14") are submitted anonymously without requiring account credentials.
- **Privacy Enforcement**: Community notes are validated to explicitly reject phone numbers or email patterns, ensuring contributors do not inadvertently expose their private identities.
- **Rate Limiting via Cryptographic Signatures**: Write operations are rate-limited using a one-way salted SHA-256 hash (`clientHash`) of the client's network signature and User-Agent, never persisting or logging raw IP addresses.

## Consequences

### Positive

- **Frictionless Emergency Access**: Citizens and volunteers can use 100% of the application's emergency features in 1–2 taps without login barriers.
- **Offline Integrity**: Users can change language, view survival guides, and queue emergency reports without network authentication.
- **Minimal Threat Surface**: Eliminates credential stuffing, password leaks, session hijacking, database user enumeration, and account takeover vectors.
- **Full Privacy Compliance**: Zero personal data collection ensures compliance with privacy principles and ethical engineering guidelines.

### Negative & Mitigations

- **Spam and Vandalism Risk**: Anonymous reporting could tempt bad actors to submit false reports.
  - _Mitigation_: Mitigated through client-side honeypots, rate limiting (5 reports/client/hour), hard character length limits, and strict mandatory human moderation before public display (ADR-005).
- **No Cross-Device Preference Sync**: User settings and checklist progress do not automatically sync between a phone and laptop.
  - _Mitigation_: Acceptable trade-off for an emergency disaster app where local device readiness is paramount.
