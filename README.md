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

## Environment Variables

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
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
- A local automation service that creates the sample daily pack, image prompts, approval records, filenames, manifest exports, approved-only scheduler CSVs, and weekly recommendation reports.
- API routes for daily generation, image batches, Markdown/CSV/JSON exports, manual metrics import, weekly reports, and post status changes.
- Internal pages for dashboard, generator, calendar, pack detail, post edit, image prompt edit, approval queue, metrics, and brand context.

V1 is intentionally manual-publish only. The app can open the right social site or composer in a logged-in browser, but it does not bypass platform permissions or post on your behalf.

## Private Social Dashboard Data Processing

SSWApp now includes the planned v1 data processing path for social dashboard exports:

- CSV upload and pasted table preview.
- Reusable column mapping templates.
- Normalized metric rows and derived rates.
- Post matching against generated/imported content.
- Private performance dashboard pages.
- Rule-based recommendations.
- Weekly report, metrics CSV, insights JSON, and sanitized prompt-context exports.

Raw imports are private and are not sent to AI providers. AI metric summaries and direct social API imports remain disabled by default with `ENABLE_AI_METRIC_ANALYSIS=false` and `ENABLE_SOCIAL_API_IMPORTS=false`.

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
$env:DATABASE_URL="postgresql://user:pass@localhost:5432/sswapp"; $env:DIRECT_URL=$env:DATABASE_URL; npx.cmd prisma validate
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
