# ADR 001: Next.js App Router as Core Framework

## Status

Accepted

## Context

Xahay requires high resilience, fast first loads under low network conditions, and solid PWA support for disaster situations across North East India.

## Decision

We use Next.js with App Router, TypeScript, and Tailwind CSS.

## Consequences

- Fast SSR/SSG rendering.
- Clean internationalized routing structure.
- Smooth offline service worker integration.
