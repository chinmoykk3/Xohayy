# ADR 002: Static Seed Data for Offline Availability

## Status
Accepted

## Context
During extreme weather disasters, cellular networks often drop completely. Critical emergency guides and helpline numbers cannot rely on live remote API servers.

## Decision
All core helpline directories and survival procedures are packaged directly into client-side seed bundles. Any demo or unverified data must explicitly include isDemo: true.

## Consequences
- Immediate zero-latency access to emergency procedures offline.
- Requires systematic data verification during build.
