# SSWApp

Internal social content operations for Signal Workshop and umbrella brands.

SSWApp helps prepare platform-native content packs, review posts before publishing, manage image prompts and asset filenames, store brand/social context, export review files, and track weekly metrics. It never auto-publishes; it opens the right social destinations so the logged-in browser can finish posting manually.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Prisma schema for Neon Postgres
- Clerk-ready owner access
- OpenAI Responses API generation with deterministic fallback
- Node test runner via `tsx`

## Local Setup

```powershell
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run prisma:generate
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

OpenAI generation works when `OPENAI_API_KEY` is present. Without it, the daily pack generator returns a deterministic review-ready fallback so the app remains usable.

To run the DB-first workflow locally or on Vercel:

```powershell
npx.cmd prisma migrate deploy
npm.cmd run seed
```

The app stays build-safe without database env vars, but operational production should set `DATABASE_URL`, `DIRECT_URL`, Clerk keys, and `OWNER_EMAILS`.

## Environment Variables

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
CLERK_ALLOWED_REDIRECT_ORIGINS=https://sitesignal.company,https://www.sitesignal.company,https://sswapp.vercel.app
OWNER_EMAILS=
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_MODEL_TEXT=
OPENAI_MODEL_IMAGE=
ENABLE_AI_CONTENT_GENERATION=false
ENABLE_AI_IMAGE_PROMPTS=false
ENABLE_IMAGE_GENERATION=false
ENABLE_AUTO_APPROVAL=false
ENABLE_AUTO_PUBLISHING=false
ENABLE_AI_METRIC_ANALYSIS=false
ENABLE_SOCIAL_API_IMPORTS=false
SOCIAL_IMPORT_MAX_BYTES=5242880
```

For Neon + Prisma, use the pooled connection for `DATABASE_URL` and the direct connection for `DIRECT_URL`.

For Clerk, keep `NEXT_PUBLIC_CLERK_DOMAIN` and `CLERK_DOMAIN` unset unless you are intentionally configuring a Clerk proxy or satellite app. The verified custom domain should be driven by Clerk's production instance and live publishable key. If owner login succeeds but owner-only API actions return `403`, add the signed-in email address to `OWNER_EMAILS` and redeploy.

## Core Workflow

1. Paste or import the weekly Deep Research brief.
2. Generate a daily content pack or use the prompt-assisted workflow.
3. Review platform-specific variants in the Approval Queue.
4. Copy post copy, hashtags, alt text, or image prompts.
5. Open the platform from Social Launchpad in the logged-in browser.
6. Manually publish, then import metrics for weekly reporting.

## Social Content Automation Engine

The automation engine includes:

- Prisma models for brands, platforms, campaigns, content pillars, content packs, post drafts, image prompts, creative assets, approvals, metrics, automation runs, prompt templates, and research briefs.
- Editable brand configs in `src/config/brands/*.json`.
- Prompt templates in `src/prompts/*.md` with `renderPrompt(templateName, variables)`.
- A DB-first automation service that persists Run Today content packs, post drafts, image prompts, approval records, filenames, manifest exports, approved-only scheduler CSVs, and weekly recommendation reports when `DATABASE_URL` is configured.
- Deterministic fallback content when OpenAI or the database is not configured, clearly labeled as local fallback.
- API routes for daily generation, image batches, Markdown/CSV/JSON exports, manual metrics import, weekly reports, and post status changes.
- Internal pages for dashboard, generator, calendar, pack detail, post edit, image prompt edit, approval queue, metrics, and brand context.

V1 is intentionally manual-publish only. The app can open the right social site or composer in a logged-in browser, but it does not bypass platform permissions or post on your behalf.

## Private Social Dashboard Data Processing

SSWApp now includes the planned v1 data processing path for social dashboard exports:

- CSV upload and pasted table preview.
- Private original import byte storage in Postgres, capped by `SOCIAL_IMPORT_MAX_BYTES`.
- Reusable column mapping templates.
- Normalized metric rows and derived rates.
- Post matching against generated/imported content.
- Private performance dashboard pages.
- Rule-based recommendations.
- Weekly report, metrics CSV, insights JSON, and sanitized prompt-context exports.

Raw imports are private and are not sent to AI providers. AI metric summaries and direct social API imports remain disabled by default with `ENABLE_AI_METRIC_ANALYSIS=false` and `ENABLE_SOCIAL_API_IMPORTS=false`.

## Facebook Dev Integration

The app includes a private `/facebook-dev` page for verifying the Facebook JavaScript SDK and Facebook Login status. This is a safe development foundation only: it strips login tokens from browser events, does not store tokens, and does not publish to Facebook.

Facebook publishing remains disabled by default. Any future posting flow must stay server-side, owner-only, approval-gated, and manual by default.

## Operational Readiness

- `/api/health` reports boolean status for database, Clerk, OpenAI, and feature flags without exposing secrets.
- `/api/automations/run-today` persists `ContentPack`, `PostDraft`, `ImagePrompt`, `Approval`, and `AutomationRun` records when the database is configured.
- `/packs/[id]`, `/calendar`, `/approvals`, social imports, social performance, and export routes read persisted records first and fall back to sample data only when the database is not configured.
- Scheduler exports are approved-only. Generated content starts as `needs_review`; approval records start as `pending`.
- Clerk protects private pages and APIs when Clerk env vars are configured. `/api/health`, `/sign-in`, `/sign-up`, and Clerk's `/__clerk` frontend API route remain public enough for the sign-in flow to complete.
- Production owner access should include `OWNER_EMAILS=chthomps84@gmail.com,chad@lswdesigns.studio` unless the CEO/Owner changes the authorized account list.

## Automation Prompt Library

SSWApp includes a versioned prompt library for daily packs, brand selection, platform posts, image prompts, carousels, short video scripts, Reddit discussions, Google Business Profile posts, newsletters, rewrites, approval summaries, dashboard analysis, metrics insights, repurposing, campaign planning, site-audit-to-content, monthly maps, and quality checks.

- Prompt files live in `src/prompts/social/`.
- Shared guardrails live in `src/prompts/system/`.
- Registry/rendering utilities live in `src/lib/prompts/`.
- Prompt debugger pages are available at `/prompts` and `/prompts/preview`.
- Automation recipes are available at `/automations/recipes`.
- The morning workflow is available at `/run-today`.

Generated content defaults to `needs_review`, approval records default to `pending`, and scheduler exports remain approved-only.

## Verification

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run prisma:validate
npm.cmd run build
```

## Brands Seeded

- Signal Workshop
- Business Signal Workshop
- Local Signal Websites
- SiteSignal
- Parallax Hearts
- AL Brothers LLC

Full operating notes are in [docs/social-content-engine.md](docs/social-content-engine.md).
Social dashboard import notes are in [docs/social-dashboard-data-processing.md](docs/social-dashboard-data-processing.md).
Automation prompt notes are in [docs/automation-prompt-library.md](docs/automation-prompt-library.md).
Automation workflow notes are in [docs/automation-workflows.md](docs/automation-workflows.md).
Codex automation setup prompts are in [docs/codex-automation-setup-prompts.md](docs/codex-automation-setup-prompts.md).
Facebook dev integration notes are in [docs/facebook-dev-integration.md](docs/facebook-dev-integration.md).
