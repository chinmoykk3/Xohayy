# Contributing to Xahay (সহায়)

Thank you for your interest in contributing to Xahay! This project is an offline-first, multilingual emergency assistant built for communities affected by monsoon floods and landslides in North East India.

To maintain the highest standards of safety, accessibility, and software engineering for crisis utility software, we ask all contributors to review and adhere to the following guidelines.

---

## 1. Code of Conduct & Core Principles

Every line of code in Xahay directly affects people in life-critical situations. Contributors must strictly uphold our core engineering principles:

1. **Emergency First**: Emergency helplines (112, 108, 101, 1070) must remain accessible within 1–2 taps on every view, online or offline.
2. **Offline by Default**: Never introduce dependencies or features that break when the network is severed.
3. **Calm, High-Contrast Design**: No flashing animations, alarmist visual banners, or tiny fonts. Adhere strictly to WCAG 2.2 AA.
4. **Data Minimization & Privacy**: Never collect or log personal names, phone numbers, email addresses, or raw client IP addresses. No user tracking or analytics SDKs.
5. **Verifiable Quality**: Every new feature or fix must include automated unit, API, or component tests.

---

## 2. Development Setup

### Prerequisites

- **Node.js**: v20.x or later (LTS recommended)
- **npm**: v10.x or later
- **Git**

### Installation

```bash
# Clone your fork
git clone https://github.com/<your-username>/xahay.git
cd xahay

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 3. Git Workflow & Commit Conventions

We follow the **Conventional Commits** specification:

- `feat:` A new feature or user-facing functionality (e.g. `feat: add Karbi language dictionary scaffold`)
- `fix:` A bug fix (e.g. `fix: adjust contrast ratio on yellow watch badge`)
- `docs:` Documentation updates (e.g. `docs: update deployment guide for Vercel`)
- `test:` Adding or updating tests (e.g. `test: add unit tests for offline report queue replay`)
- `refactor:` Code changes that neither fix a bug nor add a feature
- `perf:` Performance improvements
- `chore:` Tooling, dependency, or configuration changes

Branch naming convention:

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`

---

## 4. Quality Standards & Pre-Flight Checks

Before opening a pull request, verify that all local checks pass:

```bash
# 1. Typecheck TypeScript strictly (zero errors)
npm run typecheck

# 2. Lint code (zero warnings allowed)
npm run lint

# 3. Format code with Prettier
npm run format

# 4. Run automated test suite
npm test

# 5. Verify test coverage
npm run test:coverage

# 6. Verify production build succeeds
npm run build
```

Husky pre-commit hooks are configured to automatically check linting and formatting on staged files.

---

## 5. Accessibility Requirements (WCAG 2.2 AA)

- All interactive controls must have touch target sizes of at least **48x48 px**.
- Text contrast must exceed **4.5:1** for body copy and **3:1** for large text and UI components.
- Color must never be the sole indicator of risk (always pair colors with clear text and distinct icons).
- All modal dialogs must trap focus, close on `Escape`, and return focus to the trigger element upon dismissal.
- New components must pass automated `axe-core` accessibility audits without serious or critical violations.

---

## 6. Security & Privacy Rules

- All user inputs must be validated with Zod schemas on both client and server.
- All rendered text must be escaped; never use `dangerouslySetInnerHTML`.
- Never commit secrets, API keys, or `.env.local` files.
- Community report notes must be sanitised and checked against phone number / email patterns.

---

## 7. Submitting a Pull Request

1. Push your branch to your GitHub fork.
2. Open a Pull Request targeting the `main` branch.
3. Complete the PR template description with:
   - Summary of changes
   - Associated Build Plan or Issue ID
   - Evidence of passing tests, lint, and accessibility checks
4. Maintainers will review your submission and provide feedback.
