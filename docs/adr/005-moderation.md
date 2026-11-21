# ADR 005: Pre-Publication Moderation for Community Ground Reports

## Status

Accepted

## Context

During extreme natural disasters in North East India (such as Brahmaputra river flash floods, bridge collapses, or mountain highway landslides), public communication channels are prone to rumors, sensationalism, and panic-inducing misinformation (e.g. rumors of dam failures or false road blockages).

If user-submitted reports were published immediately to the public live feed without verification:

1. **Misallocation of First Responders**: Emergency rescue teams (SDRF, NDRF) could be dispatched to fabricated incidents, diverting critical assets away from genuine life-threatening emergencies.
2. **Public Panic**: False alerts can trigger chaotic mass movements onto hazardous, inundated roads.
3. **Loss of Public Trust**: Unverified crowd-sourced data undermines the credibility of the entire platform during crises.

## Decision

All community condition reports submitted through `POST /api/reports` require **Mandatory Moderation Before Public Display**:

1. **Default Pending Status**: All newly submitted reports are persisted with `status: "pending"`.
2. **Strict Query Isolation**: Public feeds (`GET /api/reports`) strictly query for `status: "approved"`. Pending, rejected, or expired reports are excluded from public API responses.
3. **Automated Hygiene Pre-Filters**:
   - **Honeypot Trap**: Invisible form inputs trap automated scrapers/bots and drop submissions without storing.
   - **Rate Limiting**: Salted client hashes restrict submissions to 5 per hour per device.
   - **Sanitisation**: HTML markup, script tags, and control characters are stripped. Free text notes are capped at 200 characters, and places are capped at 80 characters.
   - **Privacy Shield**: Notes containing phone numbers or email patterns are rejected upfront.
4. **Administrative Review**: Designated local administration coordinators and relief personnel review pending reports and mark them as `approved` or `rejected`.
5. **Time-To-Live (TTL)**: Unapproved pending reports expire automatically via database TTL indexes (7 days) to prevent backlog accumulation.

## Consequences

### Positive

- **High Data Reliability**: Every publicly visible community report on Xahay has been vetted for credibility.
- **Prevents Panic & Misdirection**: Erroneous or malicious posts cannot trigger false alarms or misdirect rescue teams.
- **Eliminates Stored XSS**: Combined with React escaping, strict sanitisation, and a ban on `dangerouslySetInnerHTML`, user notes cannot execute malicious scripts.

### Negative & Mitigations

- **Publication Delay**: Legitimate urgent reports do not appear on the public feed instantaneously.
  - _Mitigation_: The UI clearly communicates that submissions undergo verification before publication, and prominent notices remind users to dial **112** or direct emergency helplines immediately for emergency rescue requests rather than relying on community notice boards.
