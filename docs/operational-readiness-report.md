# Operational Readiness Report

Date: 2026-05-28

## Executive Summary

Readiness: yellow.

The app builds and the core DB-first foundation is in place. This hardening pass adds weekly workflow gap audit persistence, rule-based checkpoints, owner-protected audit endpoints, Vercel Cron configuration, a safe load-smoke script, operational tests, and documentation.

Remaining blockers before calling the app fully green:

- Run DB integration tests against a dedicated `TEST_DATABASE_URL`.
- Exercise owner-authenticated browser flows against staging/production.
- Install/authenticate CodeRabbit CLI and run the committed review.
- Confirm Vercel Cron runs with `CRON_SECRET` and weekly audit flags enabled.

## Baseline Results

| Area | Command | Status | Notes |
| --- | --- | --- | --- |
| Unit tests | `npm.cmd test` | Passed | 36/36 before this hardening pass. |
| Lint | `npm.cmd run lint` | Passed | No lint errors before this hardening pass. |
| Typecheck | `npm.cmd run typecheck` | Passed | Prisma client generated successfully. |
| Prisma validate | `npm.cmd run prisma:validate` | Passed | Schema valid before new migration. |
| Build | `npm.cmd run build` | Passed | Next.js 16.2.6, routes generated; middleware deprecation warning remains. |
| Live health | `/api/health` | Passed | Boolean config status only; no secrets returned. |

## Bugs And Risks Found

- Medium: legacy API routes lacked route-level owner checks. Fixed by adding `requireOwnerResponse()` to private mutation/export/admin routes.
- Medium: social import confirm could duplicate snapshots/rollups if confirmed repeatedly. Fixed with idempotent return for already-imported records.
- Medium: no persistent weekly workflow audit system existed. Added schema, engine, endpoints, UI, cron, and tests.
- Low: dashboard home was seed-heavy. Added latest workflow audit widget while broader dashboard DB replacement remains a future improvement.
- Low: CodeRabbit CLI unavailable locally. Documented as external review gate.

## Automations Covered

- Run Today
- Image Prompt Batch
- Caption Rewrite
- Approval Summary
- Weekly Social Analysis
- Prompt Context
- Repurpose Plan
- Campaign Plan
- Monthly Content Map
- Site Audit to Content
- Social Import Parse/Confirm
- Approved-only exports
- Weekly Workflow Gap Audit

## Persistence Proof To Run

Use a test database:

```powershell
$env:TEST_DATABASE_URL="postgresql://..."
npm.cmd run test:integration
```

Expected proof:

- Seed upserts required brands/platforms/campaigns/accounts/recipes.
- Run Today persists a content pack, post drafts, image prompts, approvals, and automation run.
- Re-query by persisted content pack id returns the same records.
- Selected brand/platform filters are honored.
- Generated statuses remain `needs_review`; approvals remain `pending`.

## Security And Privacy Proof

Implemented checks:

- `/api/health` returns booleans only.
- Private mutation/export/admin APIs now call `requireOwnerResponse()`.
- Cron endpoint requires `Authorization: Bearer ${CRON_SECRET}`.
- Weekly audit reports redact common secret patterns.
- Raw dashboard rows are excluded from workflow audit summaries and prompt-context exports.
- Auto approval and auto publishing are flagged as critical audit gaps if enabled.

Still needs staging verification:

- Unauthenticated browser access blocked by Clerk.
- Authenticated non-owner blocked by owner checks.
- Owner can run audits/imports/exports.

## Performance And Load

Added `scripts/load-smoke.mjs`.

Default:

- Base URL: `http://localhost:3000`
- VUs: `2`
- Duration: `5000ms`
- Writes disabled
- Endpoint: `/api/health`

Run:

```powershell
npm.cmd run test:load:smoke
```

Set `ENABLE_WRITE_LOAD_TESTS=true` only for isolated local/staging databases.

## Remaining Gaps

- Playwright E2E is deferred; route/API operational tests are the first pass.
- k6 is deferred; Node fetch load smoke is the first pass.
- Production Cron needs env flags enabled after deploy.
- CodeRabbit review requires CLI install/auth.
- Next.js middleware deprecation should be addressed by migrating `src/middleware.ts` to the newer proxy convention in a follow-up.

## Next Actions

Must fix before operational green:

- Deploy migration.
- Run `npm.cmd run seed`.
- Run `npm.cmd run test:integration` with `TEST_DATABASE_URL`.
- Verify owner-authenticated Run Today, social import confirm, audit run, and exports in staging/production.

Should fix soon:

- Replace remaining seed-heavy dashboard widgets with persisted summaries.
- Add persisted export AutomationRun records.
- Add browser E2E once the route/API harness is stable.

Nice to have:

- CodeRabbit committed review gate.
- Optional email/slack notification for critical weekly gaps.
