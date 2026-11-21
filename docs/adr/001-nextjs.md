# Xahay

> Offline-first emergency support Progressive Web App for floods and landslides in North East India (Problem Statement PS05).

## Core Principles

- **Emergency First**: One-tap access to 112 from every screen.
- **Offline by Default**: Works without connectivity via Service Workers and local caches.
- **Honest Data**: Shows source and timestamp; clearly marks synthetic data with isDemo: true.
- **Local Languages**: Built for Assamese, Hindi, and English.
- **Privacy & Calm UX**: Zero user tracking, lightweight bundle, accessible design.

## Tech Stack

- Next.js (App Router)
- TypeScript (Strict Mode)
- Tailwind CSS
- Zod & axe-core

## Getting Started

`ash
npm install
npm run dev
`

## Quality Commands

`ash
npm run lint
npm run typecheck
npm test
npm run build
`
"@ | Set-Content -Path README.md -Encoding utf8

@"

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
